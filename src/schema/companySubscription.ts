import { boolean, date, integer, pgTable, serial, timestamp, uuid } from 'drizzle-orm/pg-core';
import { CompanyTable } from './company';
import { SubscriptionTable } from './subscription';
import { createSelectSchema } from 'drizzle-zod';

export const CompanySubscriptionTable = pgTable('company_subscription', {
    id: uuid().notNull().primaryKey().defaultRandom(),
    companyId: uuid('company_id')
        .references(() => CompanyTable.id)
        .notNull(),
    subscriptionId: serial('subscription_id')
        .references(() => SubscriptionTable.id)
        .notNull(),
    startDate: timestamp('start_date').notNull().defaultNow(),
    endDate: timestamp('end_date').notNull(),
});


export const selectCompanySubscriptionSchema = createSelectSchema(CompanySubscriptionTable);
