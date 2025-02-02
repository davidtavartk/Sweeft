import { eq } from "drizzle-orm";
import { companyTable, type NewCompany } from "@/schema/company";
import { db } from "@/configs/db";
import { hash, sha256 } from "@/utils/hash";
import { BackendError } from "@/utils/errors";
import crypto from "node:crypto";
import consola from "consola";

export async function getCompanyByEmail(email: string) {
    const [company] = await db.select().from(companyTable).where(eq(companyTable.email, email)).limit(1);
    return company;
}

export async function getCompanyById(id: number) {
    const [company] = await db.select().from(companyTable).where(eq(companyTable.id, id)).limit(1);
    return company;
}

export async function addCompany(company: NewCompany) {
    const { name, email, password, country, industry } = company;

    const code = crypto.randomBytes(32).toString("hex");
    const hashedCode = sha256.hash(code);
    const hashedPassword = await hash(password);

    const [newCompany] = await db
        .insert(companyTable)
        .values({
            name,
            email,
            password: hashedPassword,
            country,
            industry,
            code: hashedCode,
        })
        .returning({
            id: companyTable.id,
            name: companyTable.name,
            email: companyTable.email,
            country: companyTable.country,
            industry: companyTable.industry,
            code: companyTable.code,
        });

    if (!newCompany) {
        throw new BackendError("INTERNAL_ERROR", {
            message: "Failed to add company",
        });
    }

    consola.success("Company added successfully");

    return { company: newCompany, code };
}

export async function verifyCompany(email: string, code: string) {
    const [company] = await db.select().from(companyTable).where(eq(companyTable.email, email)).limit(1);

    if (!company) throw new BackendError('COMPANY_NOT_FOUND');

    if (company.isVerified) {
        throw new BackendError('CONFLICT', {
            message: 'Company already verified',
        });
    }

    const isVerified = sha256.verify(code, company.code);

    if (!isVerified) {
        throw new BackendError('UNAUTHORIZED', {
            message: 'Invalid verification code',
        });
    }

    const [updatedcompany] = await db
        .update(companyTable)
        .set({ isVerified })
        .where(eq(companyTable.email, email))
        .returning({ id: companyTable.id });

    if (!updatedcompany) {
        throw new BackendError('INTERNAL_ERROR', {
            message: 'Failed to verify company',
        });
    }
}

export async function deleteCompany(email: string) {
    const company = await getCompanyByEmail(email);

    if (!company) throw new BackendError("COMPANY_NOT_FOUND");

    const [deletedCompany] = await db.delete(companyTable).where(eq(companyTable.email, email)).returning({
        id: companyTable.id,
        email: companyTable.email,
    });

    return deletedCompany;
}
