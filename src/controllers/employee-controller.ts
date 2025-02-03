import { verifyEmployeeSchema } from "@/schema/employee";
import { verifyEntity } from "@/services/entity-services";
import { createHandler } from "@/utils/create";
import { BackendError, getStatusFromErrorCode } from "@/utils/errors";
import consola from "consola";


export const handleVerifyEmployee = createHandler(verifyEmployeeSchema, async (req, res) => {
    try {
        const { email, code } = req.query;

        await verifyEntity('employee', email, code);
        consola.success('Employee verified successfully');
        res.status(200).json({ message: 'Employee verified successfully' });
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