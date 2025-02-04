import { db } from '@/configs/db';
import {  CompanyTable, CompanyType } from '@/schema/company';
import { EmployeeTable, EmployeeType } from '@/schema/employee';
import { SubscriptionTable } from '@/schema/subscription';
import { BackendError } from '@/utils/errors';
import { compareToHash, hash, sha256 } from '@/utils/hash';
import consola from 'consola';
import { eq, InferSelectModel } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

export const getEntityById = async <T extends PgTable>(
    table: T,
    id: string | number
  ): Promise<InferSelectModel<T> | undefined> => {

    const [entity] = await db
      .select()
      .from(table as any)
      .where(eq((table as any).id, id))
      .limit(1);
    return entity as InferSelectModel<T> | undefined;
  };

export const getEntityByEmail = async <T extends typeof EmployeeTable | typeof CompanyTable>(
    table: T,
    email: string
) => {
    const [entity] = await db.select().from(table as any).where(eq(table.email, email)).limit(1);
    return entity as T extends typeof CompanyTable ? CompanyType : EmployeeType;
};

export const deleteEntity = async (table: typeof EmployeeTable | typeof CompanyTable, email: string) => {
    const entity = await getEntityByEmail(table, email);

    if (!entity) {
        const entityName = table === CompanyTable ? "Company" : "Employee";
        throw new BackendError('USER_NOT_FOUND', {message: `${entityName} with email ${email} not found`});
    }

    const [deletedEntity] = await db.delete(table).where(eq(table.id, entity.id)).returning({
        id: table.id,
        email: table.email,
    });

    return deletedEntity;
};


export const verifyEntity = async (entityType: 'company' | 'employee', email: string, code: string) => {
    const table = entityType === 'company' ? CompanyTable : EmployeeTable;

    const [entity] = await db.select().from(table).where(eq(table.email, email)).limit(1);

    if (!entity) throw new BackendError(`NOT_FOUND`, { message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found` });

    if (entity.isVerified) {
        throw new BackendError('CONFLICT', {
            message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} already verified`,
        });
    }

    const isVerified = sha256.verify(code, entity.code);

    if (!isVerified) {
        throw new BackendError('UNAUTHORIZED', {
            message: 'Invalid verification code',
        });
    }

    const [updatedEntity] = await db
        .update(table)
        .set({ isVerified: true })
        .where(eq(table.email, email))
        .returning({ id: table.id });

    if (!updatedEntity) {
        throw new BackendError('INTERNAL_ERROR', {
            message: `Failed to verify ${entityType}`,
        });
    }
};


export const updatePassword = async (table: typeof EmployeeTable | typeof CompanyTable, email: string, password: string, newPassword: string) => {
    const entity = await getEntityByEmail(table, email);

    if (!entity) {
        throw new BackendError('USER_NOT_FOUND', { message: 'Entity not found' });
    }

    if (entity.password === null) {
        throw new BackendError('VALIDATION_ERROR', { message: 'Password not set for this entity' });
    }

    const isOldSameAsDb = await compareToHash(password, entity.password);

    if (!isOldSameAsDb) {
        throw new BackendError('INVALID_PASSWORD');
    }

    if (newPassword === password) {
        throw new BackendError('NO_CHANGES', { message: 'New password can not be the same as old password' });
    }

    const hashedPassword = await hash(newPassword);

    const [updatedEntity] = await db.update(table).set({ password: hashedPassword }).where(eq(table.email, email)).returning({
        id: table.id,
        email: table.email,
    });

    if (!updatedEntity) {
        consola.error('updated company', updatedEntity);
        throw new BackendError('INTERNAL_ERROR', {
            message: 'Failed to update password',
        });
    }

    return updatedEntity;
};
