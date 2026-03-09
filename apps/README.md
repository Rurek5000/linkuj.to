# Microservices

This directory contains all microservices for the URL shortener platform.

## Services

### 🚀 URL Service (Port 3001)
**Endpoint:** `POST /api/shorten`
- Creates shortened URLs
- Validates input
- Checks Google Safe Browsing API
- Generates unique short codes

### 🔀 Redirect Service (Port 3002)
**Endpoint:** `GET /:short_code`
- Handles redirects from short URLs to original URLs
- Publishes click events to analytics queue
- Returns 302 redirects

### 📊 Analytics Service (Port 3003)
**Endpoint:** `GET /api/analytics/:short_code`
- Serves aggregated analytics data
- Supports time range filters (24h, 7d, 30d, all)
- Returns click counts, geographic distribution

### 🗑️ Management Service (Port 3004)
**Endpoint:** `DELETE /api/links/:short_code`
- Soft deletes links
- Clears Redis cache
- Preserves analytics data

### ⏰ Analytics Worker (No Port - CronJob)
**Schedule:** Every 5 minutes
- Consumes events from Redis Streams
- Aggregates analytics data
- Writes to `analytics_aggregated` table
- Cleans up old raw events (7-day retention)

## Running Services

### Development (with Turborepo)
```bash
# From root directory
pnpm dev
```

### Individual Service
```bash
# From root
pnpm --filter @shortener/url-service dev

# Or from service directory
cd apps/url-service
pnpm dev
```

### With Docker Compose
```bash
docker-compose -f docker-compose.dev.yml up
```

## Health Checks

Each service exposes a `/health` endpoint:
- URL Service: http://localhost:3001/health
- Redirect Service: http://localhost:3002/health
- Analytics Service: http://localhost:3003/health
- Management Service: http://localhost:3004/health

## Architecture

```
┌─────────────┐
│   Frontend  │ (Astro 5 - Port 4321)
└──────┬──────┘
       │
   ┌───┴────────────────────┐
   │                        │
┌──▼────────┐      ┌───────▼──────┐
│URL Service│      │Analytics Svc │
│  :3001    │      │    :3003     │
└──────┬────┘      └──────────────┘
       │
┌──────▼────────┐
│Redirect Svc   │
│    :3002      │
└──────┬────────┘
       │
┌──────▼────────┐
│Analytics      │
│Worker (Cron)  │
└───────────────┘

[Shared Infrastructure]
┌──────────┐  ┌──────┐  ┌────────┐
│PostgreSQL│  │ Redis│  │ Queue  │
└──────────┘  └──────┘  └────────┘
```

## Next Steps

1. Implement business logic in each service
2. Connect to shared packages (@shortener/db, @shortener/redis, @shortener/shared)
3. Add middleware (rate limiting, CORS, error handling)
4. Write tests for each service
5. Create Dockerfiles for production deployment
