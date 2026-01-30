Project Context: Link Shortener Monorepo

    Architecture: Monorepo managed by pnpm workspaces and Turborepo.

    Structure:

        /apps/web: Frontend (Astro).

        /apps/api: Backend (Express) - intended as microservices.

        /packages/shared: Shared logic, Zod schemas, and TypeScript types.

        /packages/db: Database layer (PostgreSQL + ORM).

        /packages/redis: Caching layer logic.

    Concepts:

        Single Source of Truth: Shared types/validation in /packages used by both web and api.

        Microservices Ready: Each app in /apps is containerized independently.

        Task Orchestration: turbo.json handles build pipelines, caching, and dependency graphs.

        Root package.json: Manages workspaces and global dev dependencies.

    Goal: Maintain strict separation of concerns while sharing contracts (types/schemas) to ensure type-safety across the entire stack.