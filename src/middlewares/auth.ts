import { CompanyTable } from '@/schema/company';
import { EmployeeTable } from '@/schema/employee';
import { getEntityById } from '@/services/entity-services';
import { createHandler } from '@/utils/create';
import { BackendError } from '@/utils/errors';
import { verifyAccessToken } from '@/utils/jwt';

export function authenticate(entityType: 'employee' | 'company') {
    return createHandler(async (req, res, next) => {
        const { authorization } = req.headers;

        if (!authorization) {
            throw new BackendError('UNAUTHORIZED', {
                message: 'Authorization header not found',
            });
        }

        const token = authorization.split(' ')[1];

        if (!token) {
            throw new BackendError('UNAUTHORIZED', {
                message: 'Token not found. It might have expired',
            });
        }

        const { id } = verifyAccessToken(token);

        const entity = entityType === 'employee' ? await getEntityById(EmployeeTable, id) : await getEntityById(CompanyTable, id);

        if (!entity) throw new BackendError('USER_NOT_FOUND');

        if (!entity.isVerified) {
            throw new BackendError('UNAUTHORIZED', {
                message: 'User not verified',
            });
        }

        res.locals.user = entity;
        next();
    });
}
