import { relations } from "drizzle-orm";
import { EmployeeTable } from "./employee";
import { CompanySubscriptionTable } from "./companySubscription";
import { SubscriptionTable } from "./subscription";
import { CompanyTable } from "./company";

export const CompanyTableRelations = relations(CompanyTable, ({ many, one }) => ({
    employees: many(EmployeeTable),
    subscription: one(CompanySubscriptionTable, {
        fields: [CompanyTable.id],
        references: [CompanySubscriptionTable.companyId],
    }),
}));

export const SubscriptionTableRelations = relations(SubscriptionTable, ({ many }) => ({
    companySubscriptions: many(CompanySubscriptionTable),
}));

export const EmployeeRelations = relations(EmployeeTable, ({ one }) => ({
    company: one(CompanyTable, {
        fields: [EmployeeTable.companyId],
        references: [CompanyTable.id],
    }),
}));