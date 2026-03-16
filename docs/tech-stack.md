# Dokumentacja Techniczna
## Platforma do Skracania URL-i

---

## 1. Architektura Techniczna

### 1.1 Architektura Systemu (Mikroserwisy)

```
┌─────────────────┐
│   Frontend      │ (Astro 5)
│   (React 19)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼────┐ ┌─▼───────────┐
│ Serwis │ │   Serwis    │
│  URL   │ │ Analityczny │
└───┬────┘ └─────────────┘
    │
┌───▼────────┐
│  Serwis    │
│Przekierowań│
└───┬────────┘
    │
┌───▼────────┐
│ Analizator │
│   Danych   │
│(Cykliczny) │
└────────────┘

[Współdzielona Infrastruktura]
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │    Redis     │  │   Kolejka    │
│              │  │  (Pamięć     │  │  (Zdarzenia) │
│              │  │  Podręczna)  │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 1.2 Architektura Monorepo

**Zarządzanie Projektem:**
- **pnpm workspaces** - Zarządzanie zależnościami między pakietami
- **Turborepo** - Orchestracja tasków, caching, równoległe wykonanie
- **Struktura katalogów:**
  - `/apps/web` - Aplikacja frontendowa (Astro 5)
  - `/apps/api` - Mikrousługi backendowe (Express.js)
  - `/packages/shared` - Współdzielone typy TypeScript, schematy Zod, narzędzia
  - `/packages/db` - Warstwa abstrakcji bazy danych (Prisma/TypeORM)
  - `/packages/redis` - Logika cachowania i kolejek Redis

**Koncepcje Kluczowe:**
- **Single Source of Truth**: Wszystkie typy i schematy walidacji w `/packages/shared`
- **Type Safety**: Współdzielone typy TypeScript między frontendem a backendem eliminują niezgodności
- **Dependency Graph**: Turborepo automatycznie buduje pakiety w odpowiedniej kolejności
- **Build Caching**: Ponowne buildy są znacznie szybsze dzięki cachowaniu Turborepo

### 1.3 Stos Technologiczny

**Frontend:**
- Astro 5
- React 19 (dla interaktywnych komponentów)
- Tailwind CSS 4
- TypeScript (tryb ścisły)
- Zod (walidacja formularzy, import z `@shortener/shared`)

**Serwisy Backendowe:**
- Node.js + TypeScript
- Framework: Express.js (dla każdego serwisu)
- Zod (walidacja requestów, import z `@shortener/shared`)
- Każdy serwis jako osobne wdrożenie

**Pakiety Współdzielone:**
- `@shortener/shared` - Typy TypeScript, schematy Zod, stałe, utility functions
- `@shortener/db` - ORM client (Prisma/TypeORM), modele, migracje
- `@shortener/redis` - Redis client, cache service, queue service

**Infrastruktura:**
- PostgreSQL 15+ (trwałe przechowywanie danych)
- Redis 7+ (pamięć podręczna + kolejka zdarzeń przez Redis Streams)
- Cloudflare (CDN, Turnstile)
- Google Safe Browsing API

**Wdrożenie:**
- Docker + Docker Compose (rozwój lokalny)
- Kubernetes / Cloud Run / Railway (produkcja)
- Każdy serwis w `/apps` budowany jako osobny kontener Docker

### 1.4 Schemat Bazy Danych

**PostgreSQL:**

```sql
-- Tabela: links
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days',
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_short_code (short_code),
  INDEX idx_expires_at (expires_at)
);

-- Tabela: analytics_events (surowe zdarzenia, przechowywane 7 dni)
CREATE TABLE analytics_events (
  id BIGSERIAL PRIMARY KEY,
  short_code VARCHAR(10) NOT NULL,
  clicked_at TIMESTAMP DEFAULT NOW(),
  ip_hash VARCHAR(64),
  country VARCHAR(2),
  user_agent TEXT,
  INDEX idx_short_code (short_code),
  INDEX idx_clicked_at (clicked_at)
);

-- Tabela: analytics_aggregated
CREATE TABLE analytics_aggregated (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(10) NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  period_type VARCHAR(10), -- '5min', 'hour', 'day'
  click_count INT DEFAULT 0,
  countries_json JSONB, -- {"US": 10, "PL": 5}
  UNIQUE (short_code, period_start, period_type),
  INDEX idx_short_code_period (short_code, period_start)
);
```

**Redis:**

```
# Pamięć podręczna
SET short:{short_code} -> original_url (TTL 30 dni)

# Kolejka zdarzeń (Redis Streams)
XADD clicks * short_code abc123 timestamp 1234567890 country US ip_hash xxx
```

### 1.5 Punkty Końcowe API

**Serwis URL:**
- `POST /api/shorten` - Tworzenie skróconego URL
  - Treść: `{url: string}`
  - Odpowiedź: `{short_code: string, short_url: string}`

**Serwis Przekierowań:**
- `GET /:short_code` - Przekierowanie do oryginalnego URL
  - Odpowiedź: HTTP 302 lub 404

**Serwis Analityczny:**
- `GET /api/analytics/:short_code` - Pobieranie statystyk
  - Parametr: `?range=24h|7d|30d|all`
  - Odpowiedź: `{total_clicks, clicks_over_time[], countries[]}`

**Serwis Zarządzania:**
- `DELETE /api/links/:short_code` - Usuwanie linku
  - Odpowiedź: `{success: boolean}`

## 2. Szczegóły Implementacji

### 2.0 Architektura Pakietów Współdzielonych

**Pakiet @shortener/shared:**
```
/packages/shared
  /src
    /schemas       - Schematy Zod (LinkSchema, AnalyticsEventSchema, etc.)
    /types         - Typy TypeScript (Link, AnalyticsEvent, etc.)
    /constants     - Stałe (MAX_RETRIES, CACHE_TTL, etc.)
    /utils         - Funkcje pomocnicze (generateShortCode, hashIP, etc.)
  package.json
  tsconfig.json
```

**Pakiet @shortener/db:**
```
/packages/db
  /src
    /client        - Konfiguracja ORM (Prisma/TypeORM)
    /models        - Definicje modeli
    /migrations    - Migracje bazy danych
    /repositories  - Repozytoria (LinkRepository, AnalyticsRepository)
  package.json
  tsconfig.json
```

**Pakiet @shortener/redis:**
```
/packages/redis
  /src
    /client        - Konfiguracja Redis client
    /cache         - Cache service (get, set, delete)
    /queue         - Queue service (publish, consume events)
  package.json
  tsconfig.json
```

**Przykład użycia:**
```typescript
// W /apps/api/src/services/url-service.ts
import { LinkSchema } from '@shortener/shared/schemas';
import { linkRepository } from '@shortener/db';
import { cacheService } from '@shortener/redis';
import { generateShortCode } from '@shortener/shared/utils';

export async function shortenUrl(url: string) {
  const validated = LinkSchema.parse({ url });
  const shortCode = generateShortCode();

  const link = await linkRepository.create({ shortCode, url: validated.url });
  await cacheService.set(`short:${shortCode}`, url, CACHE_TTL);

  return link;
}
```

### 2.1 Serwis Skracania URL

**Implementacja:**
- Walidacja wejściowego URL (poprawny format, max 2048 znaków)
- Weryfikacja przez Google Safe Browsing API przed zapisem
- Integracja z Cloudflare Turnstile (CAPTCHA)
- Generowanie unikalnego 6-znakowego kodu (a-z, A-Z, 0-9)
- Zapis do PostgreSQL: `{short_code, original_url, created_at, expires_at, is_active}`
- Zapis do pamięci podręcznej Redis: `SET short_code -> original_url` (TTL 30 dni)
- Zwrot skróconego URL w formacie JSON

**Algorytm generowania kodu:**
```typescript
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
```

**Obsługa kolizji:**
- Sprawdzenie unikalności w bazie danych
- Ponawianie generowania do 3 razy
- Jeśli nadal kolizja, zwrócenie błędu

### 2.2 Serwis Przekierowań

**Przepływ:**
1. Odczyt z pamięci podręcznej Redis (GET short_code)
2. Jeśli nie znaleziono, odwołanie do PostgreSQL
3. Publikacja zdarzenia kliknięcia do kolejki: `{short_code, timestamp, ip_hash, country, user_agent}`
4. Przekierowanie HTTP 302 na oryginalny URL
5. Obsługa błędów (404 dla nieistniejących/wygasłych linków)

**Optymalizacja:**
- Cache-Aside Pattern
- TTL w Redis: 30 dni
- Współczynnik trafień > 95%

### 2.3 Analizator Danych

**Zadanie cykliczne (co 5 minut):**
1. Konsumpcja zdarzeń z kolejki (Redis Streams)
2. Agregacja danych:
   - Kliknięcia co 5 min
   - Kliknięcia co godzinę
   - Kliknięcia dziennie
   - Kliknięcia wg kraju
3. Zapis do tabeli `analytics_aggregated`
4. Usuwanie przetworzonych zdarzeń

**Czyszczenie starych danych:**
- Usuwanie surowych zdarzeń starszych niż 7 dni (zadanie codzienne)

### 2.4 Serwis Analityczny

**Implementacja:**
- Punkt końcowy: `GET /api/analytics/:short_code`
- Odczyt z tabeli `analytics_aggregated`
- Filtry: zakres czasowy (ostatnie 24h, 7 dni, 30 dni, cały okres)
- Zwrot zagregowanych statystyk w formacie JSON

### 2.5 Serwis Zarządzania

**Usuwanie linków:**
- Punkt końcowy: `DELETE /api/links/:short_code`
- Usunięcie miękkie (ustawienie `is_active = false`)
- Usunięcie z pamięci podręcznej Redis
- Zachowanie statystyk

**Automatyczne wygasanie:**
- Zadanie cykliczne (codziennie o 00:00 UTC)
- Oznaczanie linków starszych niż 30 dni jako wygasłe
- Usunięcie miękkie (`is_active = false`)

## 3. Wymagania Niefunkcjonalne

### 3.1 Wydajność

**Cele:**
- Skracanie URL: < 500ms (p95)
- Opóźnienie przekierowania: < 100ms (p95) dla trafień w pamięć podręczną
- Ładowanie panelu analitycznego: < 2s
- Współczynnik trafień w pamięć podręczną Redis: > 95%

**Optymalizacje:**
- Indeksy bazy danych na `short_code`, `expires_at`, `clicked_at`
- Połączenia do bazy danych w puli
- Kompresja odpowiedzi (gzip/brotli)
- CDN dla zasobów statycznych (Cloudflare)

### 3.2 Skalowalność

**Założenia:**
- Wsparcie dla ~100 linków/miesiąc początkowo
- Architektura przygotowana na skalowanie poziome (mikroserwisy)
- Redis gotowy na klaster
- PostgreSQL z replikami do odczytu (w przyszłości)

**Strategie skalowania:**
- Skalowanie horyzontalne serwisów (wiele instancji)
- Load balancing (Nginx/Cloudflare)
- Sharding bazy danych (w przyszłości, jeśli potrzebne)
- Redis Cluster dla większego obciążenia

### 3.3 Niezawodność

**Cele:**
- Dostępność systemu: > 99.5%
- RTO (Recovery Time Objective): < 1 godzina
- RPO (Recovery Point Objective): < 5 minut

**Mechanizmy:**
- Przełączanie awaryjne Redis z trwałością danych (migawki RDB)
- Kopie zapasowe PostgreSQL (codziennie, retencja 30 dni)
- Łagodna degradacja (jeśli Redis nie działa, odwołanie do PostgreSQL)
- Health check endpoints dla każdego serwisu
- Automatic restart przy awarii

### 3.4 Bezpieczeństwo

**Implementacje:**
- Tylko HTTPS (SSL/TLS) - wymuszane przez Cloudflare
- Cloudflare Turnstile do ochrony przed botami
- Google Safe Browsing API do wykrywania złośliwych URL
- Ograniczenie szybkości: 10 linków/godzinę na IP (anonimowi użytkownicy)
- Haszowanie IP (SHA-256) - brak przechowywania pełnych IP (zgodność z GDPR)
- Sanityzacja danych wejściowych (zapobieganie XSS, SQL injection)
- Parametryzowane zapytania SQL (ORM: Prisma/TypeORM)
- CORS - ograniczone domeny
- CSP (Content Security Policy) headers

**Rate Limiting:**
```typescript
// Przykład konfiguracji
const rateLimiter = {
  windowMs: 60 * 60 * 1000, // 1 godzina
  max: 10, // max 10 żądań
  keyGenerator: (req) => hashIP(req.ip)
};
```

### 3.5 Monitorowanie

**Logi:**
- Strukturalne logi JSON (Winston/Pino)
- Poziomy: ERROR, WARN, INFO, DEBUG
- Korelacja zapytań (Request ID)

**Metryki:**
- Szybkość żądań (requests/sec)
- Współczynnik błędów (%)
- Opóźnienie (p50, p95, p99)
- Współczynnik trafień w pamięć podręczną
- Rozmiar bazy danych
- Rozmiar kolejki zdarzeń

**Alerty:**
- Serwis niedostępny (>5 min)
- Współczynnik błędów > 5%
- Współczynnik trafień w pamięć podręczną < 90%
- Czas odpowiedzi > 1s (p95)
- Baza danych zapełniona > 80%

**Narzędzia:**
- Opcje: Datadog, Grafana Cloud, New Relic, CloudWatch
- Healthcheck endpoint: `GET /health`
- Metrics endpoint: `GET /metrics` (Prometheus format)

## 4. Techniczne Ryzyka i Zapobieganie

### 5.1 Awaria Redis

**Wpływ:** Spowolnienie przekierowań (zapytania do PostgreSQL)

**Zapobieganie:**
- Fallback do PostgreSQL
- Implementacja Redis Sentinel (automatic failover)
- Trwałość Redis (RDB snapshots co 5 min)
- Monitoring współczynnika trafień

### 5.2 Przeciążenie Bazy Danych

**Wpływ:** Zwiększone opóźnienia, możliwa niedostępność

**Zapobieganie:**
- Indeksy na kluczowych polach
- Połączenia w puli (max 20-50)
- Automatyczne wygasanie linków (czyszczenie danych)
- Read replicas dla ciężkich zapytań (przyszłość)

### 5.3 Kolizja Krótkich Kodów

**Wpływ:** Nadpisanie istniejącego URL, utrata danych

**Zapobieganie:**
- Sprawdzanie unikalności przed wstawieniem
- Ponawianie generowania (do 3 razy)
- UNIQUE constraint w bazie danych
- Monitoring częstotliwości kolizji

### 5.4 DDoS / Nadużycia

**Wpływ:** Przeciążenie systemu, niedostępność

**Zapobieganie:**
- Cloudflare (DDoS protection, WAF)
- Rate limiting na poziomie aplikacji
- Turnstile (bot detection)
- IP blocking list (automatyczne blokowanie)

### 5.5 Wzrost Kolejki Zdarzeń

**Wpływ:** Opóźnienia w analityce, możliwa utrata danych

**Zapobieganie:**
- Monitoring długości kolejki
- Skalowanie Analizatora Danych (więcej workerów)
- Zwiększenie częstotliwości przetwarzania (z 5 min do 1 min)
- Backup kolejki (Redis AOF)

## 5. Otwarte Decyzje Techniczne

- [ ] **Kolejka komunikatów:** Redis Streams (prostsza) vs RabbitMQ (bardziej niezawodna) vs Kafka (overkill dla MVP)
- [ ] **ORM:** Prisma (nowoczesny, typesafe) vs TypeORM (bardziej dojrzały) vs surowy SQL (najszybszy)
- [ ] **Hosting frontend:** Vercel (obsługuje Astro) vs Netlify (obsługuje Astro) vs Cloudflare Pages
- [ ] **Hosting backend:** Cloud Run (serverless) vs Railway (PaaS) vs Kubernetes (pełna kontrola)
- [ ] **Monitoring:** Grafana Cloud (open source) vs Datadog (premium) vs CloudWatch (integracja AWS)
- [ ] **Biblioteka wykresów:** Recharts (React-native) vs Chart.js (popularny) vs D3.js (zaawansowany)

## 6. Zmienne Środowiskowe

**Wymagane:**
```bash
# Baza danych
DATABASE_URL=postgresql://user:password@localhost:5433/shortener

# Redis
REDIS_URL=redis://localhost:6379

# API Keys
GOOGLE_SAFE_BROWSING_API_KEY=xxx
CLOUDFLARE_TURNSTILE_SECRET_KEY=xxx

# Aplikacja
BASE_URL=https://short.ly
NODE_ENV=production
PORT=3000

# Opcjonalne
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=3600000
LINK_EXPIRY_DAYS=30
```

---

**Wersja Dokumentu:** 1.0
**Ostatnia Aktualizacja:** 2026-01-28
**Autor:** Kacper Gorski
**Status:** Gotowy do Implementacji

**Dokumenty Powiązane:**
- [Dokument Wymagań Produktowych (PRD)](./prd.md) - Wymagania biznesowe, zakres produktu
- [Historie Użytkownika](./user-stories.md) - Szczegółowe user stories z kryteriami akceptacji
- [Plan Implementacji](./implementation-plan.md) - Fazy implementacji i zadania do wykonania
