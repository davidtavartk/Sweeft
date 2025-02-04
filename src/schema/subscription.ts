import { integer, pgTable, serial, uuid } from 'drizzle-orm/pg-core';
import { planEnum } from './enums';
import { createSelectSchema } from 'drizzle-zod';
import { InferSelectModel } from 'drizzle-orm';

export const SubscriptionTable = pgTable('subscription', {
    id: serial().notNull().primaryKey(),   
    plan: planEnum().notNull(),
    price: integer().notNull(),
    fileLimit: integer('file_limit').notNull(),
    userLimit: integer('user_limit'),
    additionalCostPerFile: integer("additional_cost_per_file").notNull(),
    additionalCostPerUser: integer("additional_cost_per_user").notNull().default(0),
});

export const selectSubscriptionSchema = createSelectSchema(SubscriptionTable);

export type SubscriptionType = InferSelectModel<typeof SubscriptionTable>; 
export type SubscriptionInsertType = Omit<SubscriptionType, 'id'>;