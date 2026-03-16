-- AlterTable
ALTER TABLE "analytics_aggregated" ALTER COLUMN "short_code" SET DATA TYPE VARCHAR(60);

-- AlterTable
ALTER TABLE "analytics_events" ALTER COLUMN "short_code" SET DATA TYPE VARCHAR(60);

-- AlterTable
ALTER TABLE "links" ALTER COLUMN "short_code" SET DATA TYPE VARCHAR(60);
