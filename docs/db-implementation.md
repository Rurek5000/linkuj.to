# Implementacja Bazy Danych - Przewodnik dla Web Deva

## Dla kogo ten przewodnik?

Jeśli znasz Next.js/Vue i podstawy SQL, ale nie pracowałeś z tym stackiem - ten przewodnik jest dla Ciebie.

---

## 1. Co musisz wiedzieć na start

### Struktura projektu (monorepo)

```
/packages/db          ← Tutaj będzie cała logika bazy danych
  /src
    /client          ← Konfiguracja połączenia
    /models          ← Definicje tabel (jak w Sequelize/Mongoose)
    /migrations      ← Migracje (jak w Laravel/Django)
    /repositories    ← Funkcje do operacji na bazie
  package.json
  tsconfig.json
```

**Podobieństwo do Next.js:**
- W Next.js masz `/lib/db.ts` - tutaj to samo, tylko w oddzielnym pakiecie
- Importujesz jak zwykły pakiet: `import { db } from '@shortener/db'`

---

## 2. Schemat bazy danych (co przechowujemy)

### 3 proste tabele:

**1. `links` - skrócone linki**
```sql
id              serial PRIMARY KEY
short_code      varchar(10) UNIQUE  -- np. "abc123"
original_url    text                -- pełny URL
created_at      timestamp
expires_at      timestamp           -- +30 dni od created_at
is_active       boolean             -- soft delete
```

**2. `analytics_events` - surowe kliknięcia (trzymane tylko 7 dni)**
```sql
id              bigserial PRIMARY KEY
short_code      varchar(10)
clicked_at      timestamp
ip_hash         varchar(64)         -- haszowane IP (GDPR)
country         varchar(2)          -- np. "PL", "US"
user_agent      text
```

**3. `analytics_aggregated` - zagregowane statystyki (na zawsze)**
```sql
id              serial PRIMARY KEY
short_code      varchar(10)
period_start    timestamp
period_end      timestamp
period_type     varchar(10)         -- '5min', 'hour', 'day'
click_count     int
countries_json  jsonb               -- {"PL": 10, "US": 5}
```

---

## 3. Wybór ORM (decyzja do podjęcia)

### Opcja A: Prisma (ZALECANA dla tego projektu)

**Dlaczego Prisma?**
- 👍 Prosty setup (znany z Next.js)
- 👍 Auto-completion w VS Code
- 👍 Type-safety out of the box
- 👍 Migracje są proste
- 👎 Mniej elastyczny niż TypeORM

**Analogia dla Next.js:**
```typescript
// Dokładnie tak jak w Next.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

await prisma.links.create({ data: { ... } })
```

### Opcja B: TypeORM

**Dlaczego TypeORM?**
- 👍 Bardziej podobny do Sequelize (jeśli znasz)
- 👍 Więcej kontroli nad zapytaniami
- 👍 Dekoratory (jak w NestJS)
- 👎 Więcej boilerplate
- 👎 Czasem trudny debugging

---

## 4. Krok po kroku: Setup z Prisma (zalecane)

### Krok 1: Zainstaluj Prisma w pakiecie `/packages/db`

```bash
cd packages/db
pnpm add prisma @prisma/client
pnpm add -D typescript @types/node
```

### Krok 2: Inicjalizuj Prisma

```bash
npx prisma init
```

To stworzy:
- `prisma/schema.prisma` - definicja tabel (jak modele w Sequelize)
- `.env` - połączenie do bazy

### Krok 3: Skonfiguruj `schema.prisma`

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Link {
  id          Int      @id @default(autoincrement())
  shortCode   String   @unique @map("short_code") @db.VarChar(10)
  originalUrl String   @map("original_url") @db.Text
  createdAt   DateTime @default(now()) @map("created_at")
  expiresAt   DateTime @map("expires_at")
  isActive    Boolean  @default(true) @map("is_active")

  @@index([shortCode])
  @@index([expiresAt])
  @@map("links")
}

model AnalyticsEvent {
  id         BigInt   @id @default(autoincrement())
  shortCode  String   @map("short_code") @db.VarChar(10)
  clickedAt  DateTime @default(now()) @map("clicked_at")
  ipHash     String?  @map("ip_hash") @db.VarChar(64)
  country    String?  @db.VarChar(2)
  userAgent  String?  @map("user_agent") @db.Text

  @@index([shortCode])
  @@index([clickedAt])
  @@map("analytics_events")
}

model AnalyticsAggregated {
  id           Int      @id @default(autoincrement())
  shortCode    String   @map("short_code") @db.VarChar(10)
  periodStart  DateTime @map("period_start")
  periodEnd    DateTime @map("period_end")
  periodType   String   @map("period_type") @db.VarChar(10)
  clickCount   Int      @default(0) @map("click_count")
  countriesJson Json?   @map("countries_json")

  @@unique([shortCode, periodStart, periodType])
  @@index([shortCode, periodStart])
  @@map("analytics_aggregated")
}
```

### Krok 4: Ustaw connection string w `.env`

```bash
# packages/db/.env
DATABASE_URL="postgresql://user:password@localhost:5432/shortener?schema=public"
```

### Krok 5: Wygeneruj migrację i zastosuj ją

```bash
# Stwórz migrację (jak git commit dla bazy)
npx prisma migrate dev --name init

# To automatycznie:
# 1. Stworzy plik SQL w prisma/migrations/
# 2. Zastosuje go na bazie
# 3. Wygeneruje TypeScript client
```

### Krok 6: Stwórz Prisma client w `/packages/db/src/client.ts`

```typescript
// packages/db/src/client.ts
import { PrismaClient } from '@prisma/client'

// Singleton pattern (ważne - unikaj multiple connections)
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'], // Przydatne do debugowania
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

### Krok 7: Stwórz repositories (opcjonalne, ale zalecane)

```typescript
// packages/db/src/repositories/link-repository.ts
import { prisma } from '../client'

export const linkRepository = {
  // Stwórz nowy link
  async create(shortCode: string, originalUrl: string) {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // +30 dni

    return prisma.link.create({
      data: {
        shortCode,
        originalUrl,
        expiresAt,
      },
    })
  },

  // Znajdź po short_code
  async findByShortCode(shortCode: string) {
    return prisma.link.findUnique({
      where: { shortCode },
    })
  },

  // Soft delete
  async softDelete(shortCode: string) {
    return prisma.link.update({
      where: { shortCode },
      data: { isActive: false },
    })
  },

  // Znajdź wygasłe linki
  async findExpired() {
    return prisma.link.findMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true,
      },
    })
  },
}
```

```typescript
// packages/db/src/repositories/analytics-repository.ts
import { prisma } from '../client'

export const analyticsRepository = {
  // Zapisz surowe zdarzenie kliknięcia
  async trackClick(data: {
    shortCode: string
    ipHash: string
    country?: string
    userAgent?: string
  }) {
    return prisma.analyticsEvent.create({
      data,
    })
  },

  // Pobierz surowe eventy do agregacji
  async getEventsForAggregation(startTime: Date, endTime: Date) {
    return prisma.analyticsEvent.findMany({
      where: {
        clickedAt: {
          gte: startTime,
          lt: endTime,
        },
      },
    })
  },

  // Zapisz zagregowane statystyki
  async saveAggregated(data: {
    shortCode: string
    periodStart: Date
    periodEnd: Date
    periodType: string
    clickCount: number
    countriesJson: Record<string, number>
  }) {
    return prisma.analyticsAggregated.upsert({
      where: {
        shortCode_periodStart_periodType: {
          shortCode: data.shortCode,
          periodStart: data.periodStart,
          periodType: data.periodType,
        },
      },
      update: {
        clickCount: data.clickCount,
        countriesJson: data.countriesJson,
      },
      create: data,
    })
  },

  // Pobierz statystyki dla dashboard
  async getStats(shortCode: string, range: '24h' | '7d' | '30d' | 'all') {
    const now = new Date()
    let startDate = new Date(0) // Epoch dla 'all'

    if (range === '24h') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    } else if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    return prisma.analyticsAggregated.findMany({
      where: {
        shortCode,
        periodStart: { gte: startDate },
      },
      orderBy: { periodStart: 'asc' },
    })
  },

  // Usuń stare surowe eventy (7+ dni)
  async deleteOldEvents() {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return prisma.analyticsEvent.deleteMany({
      where: {
        clickedAt: { lt: sevenDaysAgo },
      },
    })
  },
}
```

### Krok 8: Export z index.ts

```typescript
// packages/db/src/index.ts
export { prisma } from './client'
export { linkRepository } from './repositories/link-repository'
export { analyticsRepository } from './repositories/analytics-repository'

// Re-export typów z Prisma
export type { Link, AnalyticsEvent, AnalyticsAggregated } from '@prisma/client'
```

### Krok 9: Dodaj do `package.json` w `/packages/db`

```json
{
  "name": "@shortener/db",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "prisma": "^5.22.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

## 5. Jak używać w aplikacji (Express.js)

### Przykład: URL Service (POST /api/shorten)

```typescript
// apps/api/src/services/url-service.ts
import { linkRepository } from '@shortener/db'
import { generateShortCode } from '@shortener/shared/utils'

export async function createShortUrl(originalUrl: string) {
  // Generuj unikalny kod (z retry na kolizję)
  let shortCode: string
  let attempts = 0
  const MAX_ATTEMPTS = 3

  while (attempts < MAX_ATTEMPTS) {
    shortCode = generateShortCode() // funkcja z @shortener/shared

    // Sprawdź czy kod już istnieje
    const existing = await linkRepository.findByShortCode(shortCode)

    if (!existing) break
    attempts++
  }

  if (attempts === MAX_ATTEMPTS) {
    throw new Error('Failed to generate unique short code')
  }

  // Zapisz do bazy
  const link = await linkRepository.create(shortCode, originalUrl)

  return {
    shortCode: link.shortCode,
    shortUrl: `${process.env.BASE_URL}/${link.shortCode}`,
  }
}
```

### Przykład: Redirect Service (GET /:short_code)

```typescript
// apps/api/src/services/redirect-service.ts
import { linkRepository, analyticsRepository } from '@shortener/db'
import { cacheService } from '@shortener/redis'

export async function handleRedirect(shortCode: string, req: Request) {
  // 1. Sprawdź cache (Redis)
  let originalUrl = await cacheService.get(`short:${shortCode}`)

  // 2. Jeśli nie ma w cache, pobierz z bazy
  if (!originalUrl) {
    const link = await linkRepository.findByShortCode(shortCode)

    if (!link || !link.isActive || link.expiresAt < new Date()) {
      return null // 404
    }

    originalUrl = link.originalUrl

    // Zapisz do cache
    await cacheService.set(`short:${shortCode}`, originalUrl, 30 * 24 * 60 * 60) // 30 dni
  }

  // 3. Zapisz zdarzenie kliknięcia (async, nie blokuj redirect)
  const ipHash = hashIP(req.ip) // funkcja z @shortener/shared
  const country = await getCountryFromIP(req.ip) // GeoIP lookup

  analyticsRepository.trackClick({
    shortCode,
    ipHash,
    country,
    userAgent: req.headers['user-agent'],
  }).catch(err => console.error('Failed to track click:', err))

  return originalUrl
}
```

### Przykład: Analytics Worker (CronJob co 5 min)

```typescript
// apps/api/src/workers/analytics-worker.ts
import { analyticsRepository } from '@shortener/db'

export async function aggregateAnalytics() {
  const now = new Date()
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

  // 1. Pobierz surowe eventy z ostatnich 5 minut
  const events = await analyticsRepository.getEventsForAggregation(
    fiveMinutesAgo,
    now
  )

  // 2. Grupuj po short_code i kraju
  const aggregated = new Map<string, {
    clickCount: number
    countries: Record<string, number>
  }>()

  for (const event of events) {
    const key = event.shortCode
    const current = aggregated.get(key) || { clickCount: 0, countries: {} }

    current.clickCount++

    if (event.country) {
      current.countries[event.country] = (current.countries[event.country] || 0) + 1
    }

    aggregated.set(key, current)
  }

  // 3. Zapisz do analytics_aggregated
  for (const [shortCode, data] of aggregated.entries()) {
    await analyticsRepository.saveAggregated({
      shortCode,
      periodStart: fiveMinutesAgo,
      periodEnd: now,
      periodType: '5min',
      clickCount: data.clickCount,
      countriesJson: data.countries,
    })
  }

  console.log(`Aggregated ${events.length} events for ${aggregated.size} links`)
}
```

---

## 6. Docker Compose dla lokalnego developmentu

```yaml
# docker-compose.yml (w root projektu)
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: shortener
      POSTGRES_PASSWORD: password
      POSTGRES_DB: shortener
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Uruchom:**
```bash
docker-compose up -d
```

---

## 7. Przydatne komendy podczas developmentu

```bash
# Zastosuj migracje (po zmianach w schema.prisma)
cd packages/db
npx prisma migrate dev

# Otwórz GUI do bazy (jak phpMyAdmin)
npx prisma studio

# Wygeneruj ponownie Prisma client (po zmianach)
npx prisma generate

# Reset bazy (UWAGA: usuwa wszystkie dane!)
npx prisma migrate reset

# Zobacz aktualny stan bazy
npx prisma db pull
```

---

## 8. Najczęstsze problemy (i rozwiązania)

### Problem: "Cannot find module '@shortener/db'"

**Rozwiązanie:**
```bash
# Z roota monorepo
pnpm install
cd packages/db
npx prisma generate
```

### Problem: "Prisma Client did not initialize yet"

**Rozwiązanie:**
```typescript
// Upewnij się że importujesz z client.ts (singleton)
import { prisma } from '@shortener/db'

// A NIE bezpośrednio:
// import { PrismaClient } from '@prisma/client' ❌
```

### Problem: Migracje nie działają w produkcji

**Rozwiązanie:**
```bash
# W produkcji użyj:
npx prisma migrate deploy

# Zamiast:
npx prisma migrate dev
```

### Problem: Wolne zapytania

**Rozwiązanie:**
```typescript
// Dodaj indeksy w schema.prisma
@@index([shortCode])
@@index([createdAt, expiresAt])

// I zastosuj:
npx prisma migrate dev --name add_indexes
```

---

## 9. Alternatywa: TypeORM (jeśli wolisz)

<details>
<summary>Kliknij aby rozwinąć setup z TypeORM</summary>

### Instalacja

```bash
cd packages/db
pnpm add typeorm pg reflect-metadata
```

### Entity example

```typescript
// packages/db/src/entities/Link.ts
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'

@Entity('links')
export class Link {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true, length: 10 })
  @Index()
  shortCode: string

  @Column('text')
  originalUrl: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column('timestamp')
  @Index()
  expiresAt: Date

  @Column({ default: true })
  isActive: boolean
}
```

### Data Source

```typescript
// packages/db/src/data-source.ts
import { DataSource } from 'typeorm'
import { Link } from './entities/Link'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Link],
  synchronize: false, // NIGDY true w produkcji
  logging: true,
})
```

### Użycie

```typescript
const linkRepo = AppDataSource.getRepository(Link)
const link = await linkRepo.findOne({ where: { shortCode: 'abc123' } })
```

</details>

---

## 10. Checklist implementacji

- [ ] Zainstaluj Prisma w `/packages/db`
- [ ] Stwórz `schema.prisma` z 3 modelami
- [ ] Uruchom Docker Compose (PostgreSQL + Redis)
- [ ] Zastosuj migrację (`prisma migrate dev`)
- [ ] Stwórz singleton client w `src/client.ts`
- [ ] Zaimplementuj repositories dla każdej tabeli
- [ ] Wyeksportuj z `src/index.ts`
- [ ] Przetestuj import w aplikacji (`import { prisma } from '@shortener/db'`)
- [ ] Dodaj connection pool limits (max 20 połączeń)
- [ ] Skonfiguruj `.env` w `/apps/api` z DATABASE_URL

---

## Następne kroki

Po skończeniu tego przewodnika:
1. Przejdź do implementacji Redis (`/packages/redis`) - cache i kolejka
2. Zaimplementuj URL Service (używa `linkRepository`)
3. Zaimplementuj Redirect Service (używa `linkRepository` + Redis)
4. Zaimplementuj Analytics Worker (agregacja danych co 5 min)

**Dalsze materiały:**
- Prisma Docs: https://www.prisma.io/docs
- PostgreSQL Best Practices: https://wiki.postgresql.org/wiki/Don't_Do_This
