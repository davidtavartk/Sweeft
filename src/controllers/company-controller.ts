import { companyTable, newCompanySchema, verifyCompanySchema } from "@/schema/company";
import { createHandler } from "@/utils/create";
import { addCompany, deleteCompany, getCompanyByEmail, verifyCompany } from "@/services/company-services";
import { BackendError, getStatusFromErrorCode } from "@/utils/errors";
import { sendVerificationEmail } from "@/utils/email";
import env from "@/env";
import consola from "consola";

// Register a new company
export const handleAddCompany = createHandler(newCompanySchema, async (req, res) => {
    try {
        const company = req.body;

        const existingCompany = await getCompanyByEmail(company.email);

        if (existingCompany) {
            throw new BackendError("CONFLICT", {
                message: "Company with this email already exists",
            });
        }

        const { company: addedCompany, code } = await addCompany(company);

        const success = await sendVerificationEmail(env.DATABASE_URL, addedCompany.email, code);

        if (!success) {
            await deleteCompany(addedCompany.email);
            throw new BackendError("INTERNAL_ERROR", {
                message: "Failed to register company",
            });
        }

        res.status(201).json(addedCompany);
    } catch (error) {
        if (error instanceof BackendError) {
            res.status(getStatusFromErrorCode(error.code)).json({
                code: error.code,
                message: error.message,
                details: error.details,
            });
            return;
        }
        throw error;
    }
});

export const handleVerifyCompany = createHandler(verifyCompanySchema, async (req, res) => {
    try {
        const { email, code } = req.query;

        await verifyCompany(email, code);
        consola.success("Company verified successfully");
    } catch (err) {
        if (err instanceof BackendError) {
            res.status(getStatusFromErrorCode(err.code)).json({
                code: err.code,
                message: err.message,
                details: err.details,
            });
            return;
        }
        throw err;
    }
});
