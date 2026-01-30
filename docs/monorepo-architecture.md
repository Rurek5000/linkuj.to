# Architektura Monorepo
## Platforma do Skracania URL-i

---

## 1. Przegląd

Projekt wykorzystuje architekturę **monorepo** zarządzaną przez **pnpm workspaces** i **Turborepo**, co zapewnia:
- **Single Source of Truth** dla typów i walidacji
- **Lepszą organizację kodu** dzięki podziałowi na apps i packages
- **Szybsze buildy** dzięki cachowaniu Turborepo
- **Spójność typów** między frontendem a backendem
- **Łatwiejsze zarządzanie zależnościami** wspólnych pakietów

---

## 2. Struktura Katalogów

```
/shortener
├── apps/
│   ├── web/              # Frontend (Astro 5 + React 19)
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/              # Backend microservices (Express)
│       ├── src/
│       │   ├── url-service/
│       │   ├── redirect-service/
│       │   ├── analytics-service/
│       │   ├── analytics-worker/
│       │   └── management-service/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/           # Shared types, schemas, utils
│   │   ├── src/
│   │   │   ├── schemas/  # Zod schemas
│   │   │   ├── types/    # TypeScript types
│   │   │   ├── constants/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── db/               # Database layer (Prisma/TypeORM)
│   │   ├── src/
│   │   │   ├── client/
│   │   │   ├── models/
│   │   │   ├── migrations/
│   │   │   └── repositories/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── redis/            # Redis cache + queue
│       ├── src/
│       │   ├── client/
│       │   ├── cache/
│       │   └── queue/
│       ├── package.json
│       └── tsconfig.json
│
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace configuration
├── package.json          # Root package.json (scripts, devDependencies)
├── tsconfig.json         # Root TypeScript config
└── docker-compose.yml    # Development infrastructure
```

---

## 3. Workspace Packages

### 3.1 `@shortener/shared`

**Cel:** Single Source of Truth dla typów, schematów i narzędzi

**Zawartość:**
```typescript
// /packages/shared/src/schemas/link.schema.ts
import { z } from 'zod';

export const LinkSchema = z.object({
  shortCode: z.string().length(6).regex(/^[a-zA-Z0-9]+$/),
  originalUrl: z.string().url().max(2048),
  createdAt: z.date(),
  expiresAt: z.date(),
  isActive: z.boolean()
});

export type Link = z.infer<typeof LinkSchema>;
```

**Eksportowane:**
- Typy TypeScript (`Link`, `AnalyticsEvent`, `AggregatedStats`)
- Schematy Zod (`LinkSchema`, `AnalyticsEventSchema`)
- Stałe (`MAX_RETRIES`, `CACHE_TTL`, `SHORT_CODE_LENGTH`)
- Funkcje pomocnicze (`generateShortCode`, `hashIP`, `isValidUrl`)

**Użycie:**
```typescript
// W /apps/web
import { LinkSchema, type Link } from '@shortener/shared';

// W /apps/api
import { generateShortCode } from '@shortener/shared/utils';
```

---

### 3.2 `@shortener/db`

**Cel:** Abstrakcja warstwy bazy danych

**Zawartość:**
```typescript
// /packages/db/src/repositories/link.repository.ts
import { db } from '../client';
import type { Link } from '@shortener/shared';

export const linkRepository = {
  async create(data: Omit<Link, 'id' | 'createdAt'>) {
    return db.link.create({ data });
  },

  async findByShortCode(shortCode: string) {
    return db.link.findUnique({ where: { shortCode } });
  },

  async delete(shortCode: string) {
    return db.link.update({
      where: { shortCode },
      data: { isActive: false }
    });
  }
};
```

**Eksportowane:**
- ORM client (Prisma/TypeORM)
- Repozytoria (`linkRepository`, `analyticsRepository`)
- Migracje
- Modele

**Użycie:**
```typescript
import { linkRepository } from '@shortener/db';

const link = await linkRepository.findByShortCode('abc123');
```

---

### 3.3 `@shortener/redis`

**Cel:** Zarządzanie cache i kolejkami

**Zawartość:**
```typescript
// /packages/redis/src/cache/cache.service.ts
import { redis } from '../client';

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },

  async set(key: string, value: any, ttl: number) {
    await redis.setex(key, ttl, JSON.stringify(value));
  },

  async delete(key: string) {
    await redis.del(key);
  }
};
```

**Eksportowane:**
- Redis client
- Cache service (`get`, `set`, `delete`)
- Queue service (`publish`, `consume`, `ack`)

**Użycie:**
```typescript
import { cacheService, queueService } from '@shortener/redis';

await cacheService.set('short:abc123', 'https://example.com', 2592000);
await queueService.publish('clicks', { shortCode: 'abc123' });
```

---

## 4. Dependency Graph

```mermaid
graph TD
    A[apps/web] -->|depends on| D[@shortener/shared]
    B[apps/api] -->|depends on| D
    B -->|depends on| E[@shortener/db]
    B -->|depends on| F[@shortener/redis]
    E -->|depends on| D
    F -->|depends on| D
```

**Turborepo automatycznie:**
- Buduje pakiety w odpowiedniej kolejności (`shared` → `db`, `redis` → `web`, `api`)
- Cachuje wyniki buildów (ponowne buildy są błyskawiczne)
- Uruchamia taski równolegle gdy to możliwe

---

## 5. Turborepo Pipeline

**Konfiguracja (`turbo.json`):**
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", ".astro/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

**Jak to działa:**
1. `pnpm build` → Turborepo buduje wszystkie pakiety w grafie zależności
2. `dependsOn: ["^build"]` → Najpierw buduje zależności (packages), potem apps
3. `outputs` → Cachowane katalogi (ponowne buildy używają cache)
4. `cache: false` dla `dev` → Dev serwery nie są cachowane

---

## 6. Workflow Developmentu

### 6.1 Dodanie nowego typu

**Przykład:** Dodanie typu `User`

1. **Zdefiniuj schemat w `@shortener/shared`:**
```typescript
// /packages/shared/src/schemas/user.schema.ts
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email()
});

export type User = z.infer<typeof UserSchema>;
```

2. **Wyeksportuj w `@shortener/shared/index.ts`:**
```typescript
export { UserSchema, type User } from './schemas/user.schema';
```

3. **Użyj w aplikacjach:**
```typescript
// W /apps/api
import { UserSchema, type User } from '@shortener/shared';

// W /apps/web
import type { User } from '@shortener/shared';
```

**Turborepo automatycznie:**
- Rebuiluje `@shortener/shared` gdy wykryje zmiany
- Rebuiluje zależne pakiety (`apps/web`, `apps/api`)
- Cachuje wyniki dla przyszłych buildów

---

### 6.2 Dodanie nowego repozytorium

**Przykład:** Dodanie `userRepository`

1. **Stwórz repozytorium w `@shortener/db`:**
```typescript
// /packages/db/src/repositories/user.repository.ts
import { db } from '../client';
import type { User } from '@shortener/shared';

export const userRepository = {
  async findById(id: number): Promise<User | null> {
    return db.user.findUnique({ where: { id } });
  }
};
```

2. **Wyeksportuj w `@shortener/db/index.ts`:**
```typescript
export { userRepository } from './repositories/user.repository';
```

3. **Użyj w API:**
```typescript
// W /apps/api/src/services/user-service.ts
import { userRepository } from '@shortener/db';

const user = await userRepository.findById(1);
```

---

## 7. Best Practices

### 7.1 Type Safety

**✅ DOBRZE:**
```typescript
// Zdefiniuj typ w @shortener/shared
export const LinkSchema = z.object({ ... });
export type Link = z.infer<typeof LinkSchema>;

// Użyj tego samego typu wszędzie
import type { Link } from '@shortener/shared';
```

**❌ ŹLE:**
```typescript
// NIE duplikuj typów w różnych miejscach
// /apps/web/src/types.ts
export interface Link { ... }  // ❌ DUPLIKACJA

// /apps/api/src/types.ts
export interface Link { ... }  // ❌ DUPLIKACJA
```

---

### 7.2 Walidacja

**✅ DOBRZE:**
```typescript
// Waliduj na brzegach systemu (API endpoints, formularze)
import { LinkSchema } from '@shortener/shared';

app.post('/api/shorten', (req, res) => {
  const validated = LinkSchema.parse(req.body);  // ✅
});
```

**❌ ŹLE:**
```typescript
// NIE waliduj wewnątrz trusted code
function processLink(link: Link) {
  LinkSchema.parse(link);  // ❌ Niepotrzebne, link już jest typowany
}
```

---

### 7.3 Struktura Importów

**✅ DOBRZE:**
```typescript
// Importuj z named exports
import { LinkSchema, type Link } from '@shortener/shared';
import { linkRepository } from '@shortener/db';
import { cacheService } from '@shortener/redis';
```

**❌ ŹLE:**
```typescript
// NIE importuj całych pakietów
import * as shared from '@shortener/shared';  // ❌
```

---

## 8. Komenda Setup (Pierwsza Instalacja)

```bash
# 1. Sklonuj repozytorium
git clone <repo-url>
cd shortener

# 2. Zainstaluj zależności
pnpm install

# 3. Zbuduj wszystkie pakiety
pnpm build

# 4. Uruchom infrastrukturę (PostgreSQL, Redis)
docker-compose up -d

# 5. Uruchom migracje bazy danych
pnpm --filter @shortener/db migrate

# 6. Uruchom wszystkie dev serwery
pnpm dev
```

---

## 9. FAQ

### Dlaczego monorepo?
- **Single Source of Truth**: Jeden typ `Link` zamiast duplikacji w 3 miejscach
- **Lepszy refactoring**: Zmiana typu automatycznie aktualizuje wszystkie miejsca użycia
- **Szybsze buildy**: Turborepo cachuje wyniki

### Dlaczego pnpm?
- **Efektywność**: Współdzieli zależności między workspace'ami
- **Szybkość**: Szybszy niż npm/yarn
- **Strict mode**: Zapobiega przypadkowym importom z niepoprawnych pakietów

### Dlaczego Turborepo?
- **Caching**: Ponowne buildy są błyskawiczne
- **Równoległość**: Buduje wiele pakietów jednocześnie
- **Dependency awareness**: Rozumie graf zależności między pakietami

---

**Wersja Dokumentu:** 1.0
**Ostatnia Aktualizacja:** 2026-01-30
**Autor:** Kacper Gorski
**Status:** Gotowy do Implementacji

**Dokumenty Powiązane:**
- [CLAUDE.md](../CLAUDE.md) - Główny plik instrukcji dla Claude Code
- [Dokumentacja Techniczna](./tech-stack.md) - Szczegóły techniczne systemu
- [Plan Implementacji](./implementation-plan.md) - Fazy implementacji
