# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

URL shortener platform with real-time analytics. Anonymous users can shorten URLs and view basic statistics. Built with microservices architecture.

**Key Documentation:**
- `docs/prd.md` - Product requirements and business logic
- `docs/tech-stack.md` - Technical architecture and implementation details
- `docs/user-stories.md` - User stories with acceptance criteria (34 story points total)
- `docs/implementation-plan.md` - 6-phase development plan (8 weeks)

## Commands

- `pnpm dev` - Start development server at http://localhost:3000
- `pnpm build` - Create production build
- `pnpm start` - Run production server
- `pnpm lint` - Run ESLint

## Architecture

### Microservices Structure

The system is composed of independent services:

1. **Frontend** (Next.js 16) - User interface
2. **URL Service** - `POST /api/shorten` - Creates short URLs
3. **Redirect Service** - `GET /:short_code` - Handles redirects + event publishing
4. **Analytics Worker** - CronJob (every 5 min) - Aggregates click events
5. **Analytics Service** - `GET /api/analytics/:short_code` - Serves aggregated stats
6. **Management Service** - `DELETE /api/links/:short_code` - Deletes links

### Shared Infrastructure

- **PostgreSQL** - 3 tables: `links`, `analytics_events` (7-day retention), `analytics_aggregated`
- **Redis** - Cache (30-day TTL) + event queue (Redis Streams)
- **Cloudflare** - CDN, Turnstile (bot protection)
- **Google Safe Browsing API** - Malicious URL detection

### Key Technical Decisions

- **Redis is mandatory** - Used for caching and event queue
- **Microservices are mandatory** - Each service as separate deployment
- **Anonymous access only** - No user registration/authentication
- **30-day link expiration** - Automatic cleanup
- **5-minute analytics refresh** - CronJob frequency
- **Rate limiting** - 10 links/hour per IP

## Database Schema

```sql
-- links table
short_code (VARCHAR, UNIQUE), original_url (TEXT),
created_at, expires_at, is_active (BOOLEAN)

-- analytics_events (raw, 7-day retention)
short_code, clicked_at, ip_hash, country, user_agent

-- analytics_aggregated (permanent)
short_code, period_start, period_end, period_type,
click_count, countries_json (JSONB)
```

## Development Phases

**Phase 1 (Weeks 1-2):** Infrastructure + URL Service
**Phase 2 (Week 3):** Redirect Service + Security (Turnstile, Safe Browsing, rate limiting)
**Phase 3 (Week 4):** Analytics Worker + event collection
**Phase 4 (Week 5):** Analytics Service + dashboard with charts
**Phase 5 (Week 6):** Management + optimization + testing
**Phase 6 (Weeks 7-8):** Deployment + monitoring

## Important Constraints

- All URLs auto-expire after 30 days (soft delete)
- Raw events stored for 7 days, then deleted
- Aggregated stats stored permanently
- Short codes: 6 chars (a-z, A-Z, 0-9), check uniqueness, retry 3x on collision
- IP addresses must be hashed (SHA-256) for GDPR compliance
- Target performance: <500ms URL shortening, <100ms redirects (p95)

## Path Aliases

- `@/*` maps to project root (configured in tsconfig.json)

## Code Style

- TypeScript strict mode is enabled
- ESLint configured with Next.js core-web-vitals and typescript rules
