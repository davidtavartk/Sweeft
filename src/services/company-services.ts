import { eq } from 'drizzle-orm';
import { CompanyTable, CompanyType, type NewCompany } from '@/schema/company';
import { db } from '@/configs/db';
import { hash, sha256 } from '@/utils/hash';
import { BackendError } from '@/utils/errors';
import crypto from 'node:crypto';
import consola from 'consola';
import { getEntityByEmail } from './entity-services';
import { EmployeeTable, NewEmployee } from '@/schema/employee';

export const addCompany = async (company: NewCompany) => {
    const { name, email, password, country, industry } = company;

    const code = crypto.randomBytes(32).toString('hex');
    const hashedCode = sha256.hash(code);
    const hashedPassword = await hash(password);

    const [newCompany] = await db
        .insert(CompanyTable)
        .values({
            name,
            email,
            password: hashedPassword,
            country,
            industry,
            code: hashedCode,
        })
        .returning({
            id: CompanyTable.id,
            name: CompanyTable.name,
            email: CompanyTable.email,
            country: CompanyTable.country,
            industry: CompanyTable.industry,
            code: CompanyTable.code,
        });

    if (!newCompany) {
        throw new BackendError('INTERNAL_ERROR', {
            message: 'Failed to add company',
        });
    }

    consola.success('Company added successfully');

    return { company: newCompany, code };
};


export const changePassword = async (email: string, password: string) => {
    const hashedPassword = await hash(password);

    const [updatedCompany] = await db.update(CompanyTable).set({ password: hashedPassword }).where(eq(CompanyTable.email, email)).returning({
        id: CompanyTable.id,
        email: CompanyTable.email,
    });

    if (!updatedCompany) {
        throw new BackendError('INTERNAL_ERROR', {
            message: 'Failed to update password',
        });
    }

    return updatedCompany;
};

export const updateCompanyData = async (company: CompanyType, email: string, updatedData: Partial<NewCompany>) => {
    const { email: _email, ...dataObjectWithoutEmail } = updatedData;

    if (dataObjectWithoutEmail.name && dataObjectWithoutEmail.name === company.name) {
        throw new BackendError('NO_CHANGES', {
            message: 'The company name is the same as the existing one',
        });
    }

    if (dataObjectWithoutEmail.country && dataObjectWithoutEmail.country === company.country) {
        throw new BackendError('NO_CHANGES', {
            message: 'The company country is the same as the existing one',
        });
    }

    if (dataObjectWithoutEmail.industry && dataObjectWithoutEmail.industry === company.industry) {
        throw new BackendError('NO_CHANGES', {
            message: 'The company industry is the same as the existing one',
        });
    }

    const [updatedCompany] = await db.update(CompanyTable).set(dataObjectWithoutEmail).where(eq(CompanyTable.email, email)).returning({
        id: CompanyTable.id,
        name: CompanyTable.name,
        email: CompanyTable.email,
        country: CompanyTable.country,
        industry: CompanyTable.industry,
    });

    consola.success('Company data updated successfully:', updatedData);

    if (!updatedCompany) {
        throw new BackendError('INTERNAL_ERROR', {
            message: 'Failed to update company data',
        });
    }

    return updatedCompany;
};

export const addEmployee = async (employee: NewEmployee, companyId: string) => {
    const { firstname, lastname, email } = employee;

    const code = crypto.randomBytes(32).toString('hex');
    const hashedCode = sha256.hash(code);

    const [newEmployee] = await db
        .insert(EmployeeTable)
        .values({
            firstname,
            lastname,
            email,
            code: hashedCode,
            companyId
        })
        .returning({
            id: EmployeeTable.id,
            firstname: EmployeeTable.firstname,
            lastname: EmployeeTable.lastname,
            email: EmployeeTable.email,
            code: EmployeeTable.code,
        });

    if (!newEmployee) {
        throw new BackendError('INTERNAL_ERROR', {
            message: 'Failed to add Employee',
        });
    }

    consola.success('Employee added successfully');

    return { employee: newEmployee, code };
};
