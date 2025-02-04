import { boolean, pgTable, text, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { countryEnum, industryEnum } from './enums';
import { passwordValidation } from './helpers';
import { InferSelectModel } from 'drizzle-orm';

export const CompanyTable = pgTable(
    'company',
    {
        id: uuid().notNull().primaryKey().defaultRandom(),
        name: varchar({ length: 255 }).notNull(),
        email: varchar({ length: 255 }).notNull(),
        password: varchar({ length: 255 }).notNull(),
        country: countryEnum().notNull(),
        industry: industryEnum().notNull(),
        code: text().notNull(),
        isVerified: boolean('is_verified').notNull().default(false),
        refreshToken: text('refresh_token'),
    },
    (table) => [uniqueIndex('company_email_idx').on(table.email)]
);

export const selectCompanySchema = createSelectSchema(CompanyTable, {
    email: (schema) => schema.email(),
});

export const newCompanySchema = z.object({
    body: selectCompanySchema
        .pick({
            name: true,
            email: true,
            password: true,
            country: true,
            industry: true,
        })
        .extend({
            password: passwordValidation,
            repeatPassword: z.string(),
        })
        .refine(
            (values) => {
                return values.password === values.repeatPassword;
            },
            {
                message: 'Passwords must match!',
                path: ['repeatPassword'],
            }
        ),
});

export const verifyCompanySchema = z.object({
    query: selectCompanySchema.pick({
        email: true,
        code: true,
    }),
});

export const companyLoginSchema = z.object({
    body: selectCompanySchema.pick({
        email: true,
        password: true,
    }),
});

export const changePasswordSchema = z.object({
    body: z
        .object({
            email: z.string().email('Invalid email format'),
            password: z.string(),
            newPassword: passwordValidation,
            repeatNewPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.repeatNewPassword, {
            message: 'New passwords must match',
            path: ['repeatNewPassword'],
        }),
});

export const updateCompanyDataSchema = z.object({
    body: selectCompanySchema
        .partial({
            country: true,
            industry: true,
            name: true,
        })
        .pick({
            email: true,
        }),
});

export const updateCompanySubscriptionSchema = z.object({
    body: z.object({
        subscriptionId: z.number(),
    }),
});

export type NewCompany = z.infer<typeof newCompanySchema>['body'];
export type CompanyType = InferSelectModel<typeof CompanyTable>;
