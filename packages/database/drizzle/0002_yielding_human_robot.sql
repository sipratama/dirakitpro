DROP TABLE "project_assets" CASCADE;--> statement-breakpoint
DROP TABLE "project_submissions" CASCADE;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "features" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "technologies" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status" "project_submission_state" DEFAULT 'DRAFT' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "live_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "screenshot_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "repository_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "submitted_at" timestamp with time zone;--> statement-breakpoint
DROP TYPE "public"."project_asset_kind";