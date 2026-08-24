ALTER TABLE "lessons" ALTER COLUMN "content" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "resources" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN "video_provider_id";