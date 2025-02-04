import { db } from '@/configs/db';
import { CompanyTable } from '@/schema/company';
import { EmployeeTable } from '@/schema/employee';
import { BackendError } from '@/utils/errors';
import { eq } from 'drizzle-orm';

export async function updateRefreshToken(table: typeof EmployeeTable | typeof CompanyTable, id: string, refreshToken: string | null) {
    const [updatedItem] = await db.update(table).set({ refreshToken }).where(eq(table.id, id)).returning({ id: table.id });

    if (!updatedItem) {
        throw new BackendError('INTERNAL_ERROR', {
            message: 'Failed to update refresh token',
        });
    }

    return updatedItem;
}
