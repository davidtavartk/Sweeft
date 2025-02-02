import { boolean, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const companyTable = pgTable("company", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    country: varchar({ length: 255 }).notNull(),
    industry: varchar({ length: 255 }).notNull(),
    code: text().notNull(),
    isVerified: boolean().notNull().default(false),
});

export const selectCompanySchema = createSelectSchema(companyTable, {
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
            password: z.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, {
                message:
                    "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            }),
            repeatPassword: z.string(),
        })
        .refine(
            (values) => {
                return values.password === values.repeatPassword;
            },
            {
                message: "Passwords must match!",
                path: ["repeatPassword"],
            }
        ),
});

export const verifyCompanySchema = z.object({
    query: selectCompanySchema.pick({
        email: true,
        code: true,
    }),
});
export type NewCompany = z.infer<typeof newCompanySchema>["body"];
