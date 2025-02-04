import { db } from '@/configs/db';
import { CompanySubscriptionTable } from '@/schema/companySubscription';
import { BackendError } from '@/utils/errors';
import consola from 'consola';
import { eq, sql } from 'drizzle-orm';

export const setOrUpdateCompanySubscription = async (companyId: string, subscriptionId: number) => {
    const [companySubscription] = await db.select().from(CompanySubscriptionTable).where(eq(CompanySubscriptionTable.companyId, companyId)).limit(1);

    consola.info('Company Subscription:', companySubscription);

    if (companySubscription && companySubscription.subscriptionId === subscriptionId) {
        throw new BackendError('CONFLICT', { message: 'Company is already subscribed to this plan' });
    }

    if (!companySubscription) {
        consola.info('Company has no subscription. Creating new subscription');
    }

    if (companySubscription) {
        await db
            .update(CompanySubscriptionTable)
            .set({ subscriptionId, startDate: new Date(), endDate: sql`now() + interval '1 month'` })
            .where(eq(CompanySubscriptionTable.companyId, companyId));
    } else {
        await db
            .insert(CompanySubscriptionTable)
            .values({ companyId, subscriptionId, endDate: sql`now() + interval '1 month'` })
            .execute();
    }
};
