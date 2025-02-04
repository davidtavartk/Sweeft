import { db } from '@/configs/db';
import { employeeLoginSchema, EmployeeTable, setEmployeePasswordSetupSchema, verifyEmployeeSchema } from '@/schema/employee';
import { setEmployeePassword } from '@/services/employee-services';
import { getEntityByEmail, verifyEntity } from '@/services/entity-services';
import { updateRefreshToken } from '@/services/token-services';
import { createHandler } from '@/utils/create';
import { BackendError, getStatusFromErrorCode } from '@/utils/errors';
import { compareToHash, hash } from '@/utils/hash';
import { generateTemporaryToken, generateTokens } from '@/utils/jwt';
import consola from 'consola';
import { eq } from 'drizzle-orm';

export const handleVerifyEmployee = createHandler(verifyEmployeeSchema, async (req, res) => {
    try {
        const { email, code } = req.query;

        await verifyEntity('employee', email, code);
        consola.success('Employee verified successfully. Continue to activate');

        const employee = await getEntityByEmail(EmployeeTable, email);

        const tempToken = generateTemporaryToken(employee.id);

        res.status(200).json({
            message: 'Employee verified successfully. Please set your password.',
            requirePassword: true,
            temptoken: tempToken,
        });
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

export const handleSetEmployeePassword = createHandler(setEmployeePasswordSetupSchema, async (req, res) => {
    try {
        const { email, password } = req.body;

        const updatedEmployee = await setEmployeePassword(email, password);

        res.status(200).json({ message: 'Password set successfully', employee: updatedEmployee });
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

export const handleEmployeeLogin = createHandler(employeeLoginSchema, async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log (email, password);

        if (password == null) {
            throw new BackendError('INVALID_PASSWORD', {
                message: 'Password cannot be null or undefined. You might have to activate your accound',
            });
        }

        const employee = await getEntityByEmail(EmployeeTable, email);
        console.log(employee)

        if (!employee) throw new BackendError('USER_NOT_FOUND');

        if (!employee.isActivated) {
            throw new BackendError('UNAUTHORIZED', {
                message: 'Please activate your account before logging in',
            });
        }

        if (employee.password === null) {
            throw new BackendError('INVALID_PASSWORD', {
                message: 'Employee does not have a password set',
            });
        }

        const matchPassword = await compareToHash(password, employee.password);
        if (!matchPassword) throw new BackendError('INVALID_PASSWORD');

        const { accessToken, refreshToken } = generateTokens(employee.id);

        await updateRefreshToken(EmployeeTable, employee.id, refreshToken);

        consola.success('Employee logged in successfully');
        res.status(200).json({
            accessToken,
            refreshToken,
            employee: {
                id: employee.id,
                name: employee.firstname,
                lastname: employee.lastname || '',
                email: employee.email,
                isActivated: employee.isActivated,
            },
        });
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
