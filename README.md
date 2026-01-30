# URL Shortener Platform

> A modern URL shortener with real-time analytics, built with microservices architecture

Anonymous URL shortening platform that enables users to create short links and track basic statistics without registration. Built with Astro 5, Express.js microservices, and real-time analytics powered by PostgreSQL and Redis.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

URL Shortener Platform solves the need for a simple, no-registration tool to shorten long URLs and track basic click statistics in real-time. The platform is designed for anonymous users who want quick access to URL shortening without the complexity of account management.

### Key Features

- **Anonymous Access**: No registration required - start shortening URLs immediately
- **Real-Time Analytics**: Track click statistics with 5-minute refresh intervals
- **Geographic Insights**: View click distribution by country
- **Link Management**: Delete links and automatic 30-day expiration
- **Security First**: Bot protection (Cloudflare Turnstile) and malicious URL detection (Google Safe Browsing API)
- **Rate Limited**: 10 links per hour per IP to prevent abuse
- **Fast Performance**: <500ms URL shortening, <100ms redirects (p95)

### Architecture

Built with a microservices architecture for scalability and maintainability:

1. **Frontend** (Astro 5) - User interface with React islands
2. **URL Service** - Creates short URLs with validation and security checks
3. **Redirect Service** - Handles redirects and publishes click events
4. **Analytics Worker** - CronJob that aggregates click data every 5 minutes
5. **Analytics Service** - Serves aggregated statistics to the dashboard
6. **Management Service** - Handles link deletion and expiration

All services share a common infrastructure (PostgreSQL, Redis) and communicate through Redis Streams for event processing.

## Tech Stack

### Frontend

- **[Astro 5](https://astro.build/)** - Modern web framework with partial hydration
- **[React 19](https://react.dev/)** - For interactive components (Astro islands)
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Strict mode enabled for type safety
- **[Zod](https://zod.dev/)** - Schema validation (imported from `@shortener/shared`)

### Backend

- **[Node.js](https://nodejs.org/)** (v24.11.1) - JavaScript runtime
- **[Express.js](https://expressjs.com/)** - Web framework for each microservice
- **[TypeScript](https://www.typescriptlang.org/)** - Strict mode for all services
- **[Zod](https://zod.dev/)** - Request validation (imported from `@shortener/shared`)

### Infrastructure

- **[PostgreSQL](https://www.postgresql.org/)** 15+ - Primary database (3 tables: links, analytics_events, analytics_aggregated)
- **[Redis](https://redis.io/)** 7+ - Caching layer (30-day TTL) + event queue (Redis Streams)
- **[Cloudflare](https://www.cloudflare.com/)** - CDN and Turnstile bot protection
- **[Google Safe Browsing API](https://developers.google.com/safe-browsing)** - Malicious URL detection

### Monorepo Tools

- **[pnpm](https://pnpm.io/)** (v10.28.2) - Fast, disk space efficient package manager
- **[Turborepo](https://turbo.build/)** - Task orchestration with caching and parallel execution
- **[pnpm workspaces](https://pnpm.io/workspaces)** - Dependency management across packages

### Project Structure

```
/apps
  /web          - Frontend (Astro 5)
  /api          - Backend microservices (Express)

/packages
  /shared       - Shared logic, Zod schemas, TypeScript types (Single Source of Truth)
  /db           - Database layer (PostgreSQL + ORM: Prisma/TypeORM)
  /redis        - Redis caching and queue logic
```

### Deployment

- **Local Development**: Docker + Docker Compose
- **Production Options**: Kubernetes / Cloud Run / Railway
- Each service in `/apps` is containerized independently

## Getting Started Locally

### Prerequisites

- **Node.js**: v24.11.1 (specified in `.nvmrc`)
- **pnpm**: v9.0.0 or higher (v10.28.2 recommended)
- **Docker & Docker Compose**: For PostgreSQL and Redis (recommended for local development)

If you use `nvm`, you can install the correct Node.js version:

```bash
nvm use
```

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd shortener
```

2. Install dependencies across all workspaces:

```bash
pnpm install
```

3. Set up environment variables. Create `.env` files in the appropriate locations:

**Required environment variables:**

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5433/shortener

# Redis
REDIS_URL=redis://localhost:6379

# API Keys
GOOGLE_SAFE_BROWSING_API_KEY=your_api_key_here
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_secret_key_here

# Application
BASE_URL=http://localhost:4321
NODE_ENV=development
PORT=3000

# Optional (defaults provided)
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=3600000
LINK_EXPIRY_DAYS=30
```

4. Start infrastructure services (PostgreSQL, Redis):

```bash
docker-compose up -d
```

5. Run database migrations:

```bash
pnpm --filter @shortener/db migrate
```

6. Start all development servers:

```bash
pnpm dev
```

The frontend will be available at `http://localhost:4321` and the API services will start on their configured ports.

### Workspace-Specific Development

To run individual workspaces:

```bash
# Start only frontend
pnpm --filter @shortener/web dev

# Start only API services
pnpm --filter @shortener/api dev

# Build only shared package
pnpm --filter @shortener/shared build
```

## Available Scripts

### Monorepo Commands (run from root)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers (uses Turborepo) |
| `pnpm build` | Build all apps and packages (uses Turborepo) |
| `pnpm test` | Run tests across all workspaces (uses Turborepo) |
| `pnpm lint` | Lint all code (uses Turborepo) |
| `pnpm type-check` | Type-check all TypeScript code (uses Turborepo) |
| `pnpm clean` | Clean build outputs and node_modules |
| `pnpm format` | Format all code with Prettier |

### Workspace-Specific Commands

Use `pnpm --filter <workspace>` to run commands in specific packages:

```bash
# Examples
pnpm --filter @shortener/web dev
pnpm --filter @shortener/api test
pnpm --filter @shortener/shared build
```

### Turborepo Features

- **Caching**: Build outputs are cached and reused across runs
- **Parallel Execution**: Independent tasks run in parallel automatically
- **Dependency Graph**: Turborepo understands workspace dependencies and builds in the correct order

## Project Scope

### In Scope (MVP)

- ✅ Anonymous URL shortening (no registration required)
- ✅ Automatic short code generation (6 characters: a-z, A-Z, 0-9)
- ✅ Fast real-time redirects (<100ms p95)
- ✅ Basic analytics dashboard (click count, geographic distribution, timestamps)
- ✅ Link deletion functionality
- ✅ Automatic 30-day link expiration
- ✅ Spam protection and bot prevention (Cloudflare Turnstile)
- ✅ Malicious URL detection (Google Safe Browsing API)
- ✅ Rate limiting (10 links/hour per IP)
- ✅ Responsive mobile-first design

### Out of Scope

The following features are **not** included in the current MVP:

- ❌ User registration and authentication
- ❌ Custom short codes (vanity URLs)
- ❌ Advanced analytics (devices, browsers, city-level data)
- ❌ QR code generation
- ❌ UTM parameter builder
- ❌ Public API for external integrations
- ❌ Premium plans or monetization
- ❌ Link grouping or tagging

### Performance Targets

| Metric | Target |
|--------|--------|
| URL shortening latency | < 500ms (p95) |
| Redirect latency (cache hit) | < 100ms (p95) |
| Analytics dashboard load time | < 2s |
| System uptime | > 99.5% |
| Redis cache hit rate | > 95% |

### Data Retention

- **Links**: 30 days (automatic soft delete)
- **Raw analytics events**: 7 days (then deleted)
- **Aggregated analytics**: Permanent

## Project Status

🚧 **In Active Development**

The project is currently in the initial development phase. See the detailed development plan in [`docs/implementation-plan.md`](./docs/implementation-plan.md).

### Development Phases

| Phase | Duration | Status | Description |
|-------|----------|--------|-------------|
| **Phase 1** | Weeks 1-2 | 🚧 In Progress | Infrastructure setup + URL Service |
| **Phase 2** | Week 3 | ⏳ Planned | Redirect Service + Security (Turnstile, Safe Browsing, rate limiting) |
| **Phase 3** | Week 4 | ⏳ Planned | Analytics Worker + event collection |
| **Phase 4** | Week 5 | ⏳ Planned | Analytics Service + dashboard with charts |
| **Phase 5** | Week 6 | ⏳ Planned | Management + optimization + testing |
| **Phase 6** | Weeks 7-8 | ⏳ Planned | Deployment + monitoring |

### Documentation

- 📋 [Product Requirements (PRD)](./docs/prd.md) - Business requirements and product scope
- 🛠️ [Technical Stack](./docs/tech-stack.md) - Architecture and implementation details
- 🏗️ [Monorepo Architecture](./docs/monorepo-architecture.md) - Workspace structure and best practices
- 📖 [User Stories](./docs/user-stories.md) - User stories with acceptance criteria (34 story points)
- 📅 [Implementation Plan](./docs/implementation-plan.md) - 6-phase development roadmap (8 weeks)

## License

To be determined.

---

**Author**: Kacper Gorski
**Last Updated**: 2026-01-30
**Version**: 1.0.0

For questions or feedback, please open an issue in the repository.
