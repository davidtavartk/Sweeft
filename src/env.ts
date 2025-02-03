import consola from 'consola';
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    API_BASE_URL: z.string().default('http://localhost:3000'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string(),
    POSTGRES_DB: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_USER: z.string(),
    GOOGLE_APP_SENDER_EMAIL: z.string().email(),
    GOOGLE_APP_SENDER_PASSWORD: z.string(),
    POSTGRES_PORT: z.coerce.number().default(5432),
    JWT_SECRET: z.string(),
});

export type Env = z.infer<typeof envSchema>;

const env: Env = envSchema.parse(process.env);

const validationResult = envSchema.safeParse(process.env);

if (!validationResult.success) {
    consola.error('❌ Invalid env:');
    consola.error(JSON.stringify(validationResult.error.format(), null, 2));
    process.exit(1);
}

export default env;