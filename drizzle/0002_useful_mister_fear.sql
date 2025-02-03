ALTER TABLE "employee" RENAME COLUMN "companyId" TO "company_id";--> statement-breakpoint
ALTER TABLE "employee" RENAME COLUMN "isVerified" TO "is_verified";--> statement-breakpoint
ALTER TABLE "employee" RENAME COLUMN "refreshToken" TO "refresh_token";--> statement-breakpoint
ALTER TABLE "employee" DROP CONSTRAINT "employee_companyId_company_id_fk";
--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;