import { db } from '@/configs/db';
import { EmployeeTable } from '@/schema/employee';
import { BackendError } from '@/utils/errors';
import { hash } from '@/utils/hash';
import consola from 'consola';
import { eq } from 'drizzle-orm';
import { get } from 'http';
import { getEntityByEmail } from './entity-services';

export const setEmployeePassword = async (email: string, password: string) => {
    const employee = await getEntityByEmail(EmployeeTable, email);

    if (!employee) {
        throw new BackendError('USER_NOT_FOUND', {
            message: `Employee with email ${email} not found`,
        });
    }

    if (employee.isActivated) {
        throw new BackendError('CONFLICT', {
            message: 'Employee already activated',
        });
    }

    if (!employee.isVerified) {
        throw new BackendError('UNAUTHORIZED', {
            message: 'Employee not verified',
        });
    }

    const hashedPassword = await hash(password);

    const [setEmployee] = await db
        .update(EmployeeTable)
        .set({ password: hashedPassword, isActivated: true })
        .where(eq(EmployeeTable.email, email))
        .returning({
            email: EmployeeTable.email,
            firstname: EmployeeTable.firstname,
            lastname: EmployeeTable.lastname,
            isActivated: EmployeeTable.isActivated,
        });

    if (!setEmployee) {
        throw new BackendError('INTERNAL_ERROR', {
            message: 'Failed to set employee password',
        });
    }

    consola.success('Employee is activated! Congratulations', setEmployee);

    return setEmployee;
};
