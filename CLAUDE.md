# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

URL shortener platform with real-time analytics. Anonymous users can shorten URLs and view basic statistics. Built with microservices architecture.

**Key Documentation:**
- `docs/prd.md` - Product requirements and business logic
- `docs/tech-stack.md` - Technical architecture and implementation details
- `docs/monorepo-architecture.md` - Monorepo structure, packages, workflow, best practices
- `docs/user-stories.md` - User stories with acceptance criteria (34 story points total)
- `docs/implementation-plan.md` - 6-phase development plan (8 weeks)

## Commands

**Monorepo commands (run from root):**
- `pnpm install` - Install all dependencies across workspaces
- `pnpm dev` - Start all development servers (uses Turborepo)
- `pnpm build` - Build all apps and packages (uses Turborepo)
- `pnpm test` - Run tests across all workspaces (uses Turborepo)
- `pnpm lint` - Lint all code (uses Turborepo)
- `pnpm exec prettier . --write` - Format all code with Prettier

**Workspace-specific commands:**
- `pnpm --filter @shortener/web dev` - Start only frontend
- `pnpm --filter @shortener/api dev` - Start only API
- `pnpm --filter @shortener/shared build` - Build only shared package

**Turborepo features:**
- Caching: Build outputs are cached and reused
- Parallel execution: Tasks run in parallel when possible
- Dependency graph: Turborepo understands workspace dependencies

## Architecture

### Monorepo Structure

The project uses **pnpm workspaces** and **Turborepo** for task orchestration:

```
/apps
  /web          - Frontend (Astro 5)
  /api          - Backend microservices (Express)

/packages
  /shared       - Shared logic, Zod schemas, TypeScript types (Single Source of Truth)
  /db           - Database layer (PostgreSQL + ORM: Prisma/TypeORM)
  /redis        - Redis caching and queue logic
```

**Key Principles:**
- **Single Source of Truth**: All types and validation schemas in `/packages/shared`
- **Type Safety**: Shared TypeScript types ensure consistency between frontend and backend
- **Microservices Ready**: Each app in `/apps` is containerized independently
- **Task Orchestration**: `turbo.json` manages build pipelines, caching, and dependency graphs

### Microservices Structure

The system is composed of independent services:

1. **Frontend** (`/apps/web`) - Astro 5 - User interface
2. **URL Service** - `POST /api/shorten` - Creates short URLs
3. **Redirect Service** - `GET /:short_code` - Handles redirects + event publishing
4. **Analytics Worker** - CronJob (every 5 min) - Aggregates click events
5. **Analytics Service** - `GET /api/analytics/:short_code` - Serves aggregated stats
6. **Management Service** - `DELETE /api/links/:short_code` - Deletes links

**Note:** Microservices 2-6 are implemented in `/apps/api` as separate Express applications.

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

## Workspace Dependencies

**Shared packages** are referenced in apps using workspace protocol:

```json
{
  "dependencies": {
    "@shortener/shared": "workspace:*",
    "@shortener/db": "workspace:*",
    "@shortener/redis": "workspace:*"
  }
}
```

**Import examples:**
```typescript
import { LinkSchema } from '@shortener/shared';
import { db } from '@shortener/db';
import { cacheService } from '@shortener/redis';
```

## Path Aliases

- `@/*` maps to project root (configured in tsconfig.json)
- `@shortener/shared` - Shared types, schemas, and utilities
- `@shortener/db` - Database models and operations
- `@shortener/redis` - Redis cache and queue operations

## Code Style

### General Rules

- TypeScript strict mode is enabled
- Prettier for code formatting - run `pnpm exec prettier . --write`
- ESLint configured for TypeScript

### Comments Policy

- **Do NOT add comments to code** unless the logic is genuinely complex and non-obvious
- Code should be self-documenting through clear naming and structure
- Never add JSDoc, docstrings, or type annotations to code you didn't change
- If you need to explain what code does, refactor it to be clearer instead

### React & Components

- Use **functional components only** (no class components)
- Prefer React hooks for state management
- Components should be in Astro files (`.astro`) or React files (`.tsx`) for islands
- Keep components small and focused on single responsibility
- Use TypeScript interfaces for props

### Naming Conventions

- **Files**: kebab-case (e.g., `url-service.ts`, `analytics-worker.ts`)
- **Components**: PascalCase (e.g., `UrlForm.tsx`, `AnalyticsDashboard.astro`)
- **Functions/variables**: camelCase (e.g., `generateShortCode`, `urlService`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `CACHE_TTL`)
- **Types/Interfaces**: PascalCase with descriptive names (e.g., `LinkData`, `AnalyticsEvent`)

### Error Handling

- Always validate user input at API boundaries
- Use try-catch blocks for async operations and external API calls
- Return appropriate HTTP status codes:
  - `400` for validation errors
  - `404` for not found resources
  - `429` for rate limit exceeded
  - `500` for server errors
- Log errors with context (short_code, timestamp, error message)
- Never expose internal error details to users
- Handle database connection failures gracefully
- Implement retry logic for transient failures (Redis, external APIs)
