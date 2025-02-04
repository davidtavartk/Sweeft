ALTER TABLE "company_subscription" ALTER COLUMN "start_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "company_subscription" ALTER COLUMN "start_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "company_subscription" ALTER COLUMN "end_date" SET DATA TYPE timestamp;