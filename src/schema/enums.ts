import { pgEnum } from 'drizzle-orm/pg-core';
import { countries, industries } from '@/utils/constants';

export const industryEnum = pgEnum('industry', industries);
export const countryEnum = pgEnum('country', countries);
export const planEnum = pgEnum('plan', ['Free', 'Basic', 'Premium']);
