-- CreateTable
CREATE TABLE "links" (
    "id" SERIAL NOT NULL,
    "short_code" VARCHAR(10) NOT NULL,
    "original_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" BIGSERIAL NOT NULL,
    "short_code" VARCHAR(10) NOT NULL,
    "clicked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_hash" VARCHAR(64),
    "country" VARCHAR(2),
    "user_agent" TEXT,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_aggregated" (
    "id" SERIAL NOT NULL,
    "short_code" VARCHAR(10) NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "period_type" VARCHAR(10) NOT NULL,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "countries_json" JSONB,

    CONSTRAINT "analytics_aggregated_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "links_short_code_key" ON "links"("short_code");

-- CreateIndex
CREATE INDEX "links_short_code_idx" ON "links"("short_code");

-- CreateIndex
CREATE INDEX "links_expires_at_idx" ON "links"("expires_at");

-- CreateIndex
CREATE INDEX "analytics_events_short_code_idx" ON "analytics_events"("short_code");

-- CreateIndex
CREATE INDEX "analytics_events_clicked_at_idx" ON "analytics_events"("clicked_at");

-- CreateIndex
CREATE INDEX "analytics_aggregated_short_code_period_start_idx" ON "analytics_aggregated"("short_code", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_aggregated_short_code_period_start_period_type_key" ON "analytics_aggregated"("short_code", "period_start", "period_type");
