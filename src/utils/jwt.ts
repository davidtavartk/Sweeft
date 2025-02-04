import env from '@/env';
import jwt from 'jsonwebtoken';
import { BackendError } from './errors';

const ACCESS_TOKEN_CONFIG: jwt.SignOptions = {
    expiresIn: '1h',
};

const REFRESH_TOKEN_CONFIG: jwt.SignOptions = {
    expiresIn: '7d',
};

export function generateTokens(id: string) {
    const accessToken = jwt.sign({ id }, env.JWT_SECRET, ACCESS_TOKEN_CONFIG);
    const refreshToken = jwt.sign({ id }, env.JWT_SECRET, REFRESH_TOKEN_CONFIG);
    return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string) {
    try {
        const data = jwt.verify(token, env.JWT_SECRET);
        return data as { id: string };
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new BackendError('TOKEN_EXPIRED');
        }
        throw new BackendError('UNAUTHORIZED', {
            message: 'Invalid access token',
        });
    }
}

export const generateTemporaryToken = (id: string) => {
    return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: '20m' });
};
