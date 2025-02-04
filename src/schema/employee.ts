import { boolean, pgTable, text, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { CompanyTable } from './company';
import { InferSelectModel } from 'drizzle-orm';
import { createSelectSchema } from 'drizzle-zod';
import { passwordValidation } from './helpers';
import { z } from 'zod';

export const EmployeeTable = pgTable(
    'employee',
    {
        id: uuid().notNull().primaryKey().defaultRandom(),
        companyId: uuid("company_id")
            .references(() => CompanyTable.id)
            .notNull(),
        firstname: varchar({ length: 255 }).notNull(),
        lastname: varchar({ length: 255 }).notNull(),
        email: varchar({ length: 255 }).notNull(),
        password: varchar({ length: 255 }),
        code: text().notNull(),
        isVerified: boolean("is_verified").notNull().default(false),
        isActivated: boolean("is_activated").notNull().default(false),
        refreshToken: text("refresh_token"),
    },
    (table) => [
        uniqueIndex('employee_email_idx').on(table.email),
    ]
);

export const selectEmployeeSchema = createSelectSchema(EmployeeTable, {
    email: (schema) => schema.email(),
});

export const newEmployeeSchema = z.object({
    body: selectEmployeeSchema
        .pick({
            firstname: true,
            lastname: true,
            email: true,
        })
});

export const verifyEmployeeSchema = z.object({
    query: selectEmployeeSchema.pick({
        email: true,
        code: true,
    }),
});

export const setEmployeePasswordSetupSchema = z.object({
    body: selectEmployeeSchema.pick({
        email: true,
        password: true,
    }).extend({
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

export const employeeLoginSchema = z.object({
    body: selectEmployeeSchema.pick({
        email: true,
        password: true,
    }),
});

export const deleteEmployeeSchema = z.object({
    params: selectEmployeeSchema.pick({
        email: true,
    }),
});

export type NewEmployee = z.infer<typeof newEmployeeSchema>['body'];
export type EmployeeType = InferSelectModel<typeof EmployeeTable>;