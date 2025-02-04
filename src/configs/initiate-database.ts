// Database Initiation should be pre-done on the server side before the application starts.
// This is to ensure that the database is ready to be used by the application. I'll call the function once and comment it.
// Do not uncoment several times - it will cause duplicate data in the database.

import { db } from '@/configs/db';
import { SubscriptionInsertType, SubscriptionTable, SubscriptionType } from '@/schema/subscription';

const defaultSubscriptions: SubscriptionInsertType[] = [
    {
        plan: 'Free',
        price: 0,
        fileLimit: 5,
        userLimit: 1,
        additionalCostPerFile: 0,
        additionalCostPerUser: 0,
    },
    {
        plan: 'Basic',
        price: 10,
        fileLimit: 100,
        userLimit: 10,
        additionalCostPerFile: 1,
        additionalCostPerUser: 0,
    },
    {
        plan: 'Premium',
        price: 50,
        fileLimit: 1000,
        userLimit: null,
        additionalCostPerFile: 2,
        additionalCostPerUser: 5,
    },
];

const seedSubscriptions = async () => {
    try {
        await db.insert(SubscriptionTable).values(defaultSubscriptions as any);
        console.log('Default subscriptions seeded successfully');
    } catch (error) {
        console.error("Error seeding subscriptions:", error);
    }
};

const initiateDatabase = async () => {
    try {
        await seedSubscriptions();
        console.log('Database initiated successfully');
    } catch (error) {
        console.error("Error initializing the database:", error);
    }
   
}
export const callInitiateDatabaseOnUncomment = async () => {
    // await initiateDatabase();
}
