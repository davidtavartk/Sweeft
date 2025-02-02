import bcrypt from "bcrypt";
import crypto from 'node:crypto';

const saltRounds = 10;

export const hash = async (password: string): Promise<string> => {
    return bcrypt.hash(password, saltRounds);
};

export const compareToHash= async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};



export const sha256 = {
    hash: (code: string) => crypto.createHash('sha256').update(code).digest('hex'),
    verify: (code: string, hashedCode: string) =>
        crypto.createHash('sha256').update(code).digest('hex') === hashedCode,
};
