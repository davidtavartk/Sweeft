CREATE TABLE "employee" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"companyId" uuid NOT NULL,
	"firstname" varchar(255) NOT NULL,
	"lastname" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"code" text NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"refreshToken" text
);
--> statement-breakpoint
ALTER TABLE "company" RENAME COLUMN "isVerified" TO "is_verified";--> statement-breakpoint
ALTER TABLE "company" RENAME COLUMN "refreshToken" TO "refresh_token";--> statement-breakpoint
DROP INDEX "emailIndex";--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_companyId_company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "employee_email_idx" ON "employee" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "company_email_idx" ON "company" USING btree ("email");