# Plan Implementacji
## Platforma do Skracania URL-i

---

## Fazy Implementacji

### Faza 1: Infrastruktura i Podstawowe Serwisy (Tydzień 1-2)

**Zadania - Monorepo Setup:**
- [x] Inicjalizacja monorepo (pnpm workspaces + Turborepo)
- [x] Konfiguracja `turbo.json` (pipelines: build, dev, test, lint)
- [x] Stworzenie struktury katalogów (`/apps/web`, `/apps/*-service`, `/packages/*`)
- [x] Konfiguracja TypeScript (strict mode, path aliases)
- [x] Setup `@shortener/shared` - typy, schematy Zod, utils
- [x] Setup `@shortener/db` - Prisma/TypeORM, migracje, repozytoria
- [x] Setup `@shortener/redis` - Redis client, cache service, queue service

**Zadania - Infrastruktura:**
- [x] Konfiguracja Docker Compose (PostgreSQL, Redis, pgAdmin)
- [x] Inicjalizacja projektu Astro 5 w `/apps/web`
- [x] Inicjalizacja mikrousług (5 serwisów):
  - [x] `/apps/url-service` - POST /api/shorten (Port 3001)
  - [x] `/apps/redirect-service` - GET /:short_code (Port 3002)
  - [x] `/apps/analytics-service` - GET /api/analytics/:short_code (Port 3003)
  - [x] `/apps/management-service` - DELETE /api/links/:short_code (Port 3004)
  - [x] `/apps/analytics-worker` - CronJob (agregacja co 5 min)
- [x] Schemat bazy danych (migracje w `@shortener/db`)
- [x] Konfiguracja workspace dependencies między pakietami

**Zadania - Serwis URL:**
- [x] Implementacja `generateShortCode()` w `@shortener/shared/utils`
- [x] Schematy Zod w `@shortener/shared/schemas` (LinkSchema)
- [x] Link repository w `@shortener/db`
- [x] Cache service w `@shortener/redis` (stub - queueService niezaimplementowany)
- [x] Logika biznesowa w `/apps/url-service`
- [x] Obsługa kolizji short codes (retry logic)

**Rezultat:** Działające skracanie URL z pełną architekturą monorepo

### Faza 2: Przekierowania i Zabezpieczenia (Tydzień 3)

**Zadania:**
- [ ] Serwis Przekierowań - GET /:short_code
- [ ] Integracja z Google Safe Browsing API
- [ ] Integracja z Cloudflare Turnstile
- [ ] Rate limiting (express-rate-limit lub podobne)
- [ ] Haszowanie IP (SHA-256)
- [ ] Obsługa błędów (404, 500)

**Rezultat:** Pełny przepływ skracania i przekierowań z zabezpieczeniami

### Faza 3: Analityka - Zbieranie Zdarzeń (Tydzień 4)

**Zadania:**
- [ ] Konfiguracja Redis Streams
- [ ] Publikacja zdarzeń kliknięć (przy przekierowaniu)
- [ ] Geolokalizacja IP (biblioteka: geoip-lite lub MaxMind)
- [ ] Analizator Danych - zadanie cykliczne (node-cron)
- [ ] Agregacja danych do analytics_aggregated

**Rezultat:** Zbieranie i agregacja statystyk w tle

### Faza 4: Analityka - Frontend (Tydzień 5)

**Zadania:**
- [ ] Serwis Analityczny - GET /api/analytics/:short_code
- [ ] Panel analityczny (React komponenty jako wyspy Astro)
- [ ] Wykresy (biblioteka: Recharts lub Chart.js)
- [ ] Filtry zakresów czasowych
- [ ] Odświeżanie danych co 5 minut

**Rezultat:** Pełny panel analityczny z wizualizacjami

### Faza 5: Zarządzanie i Optymalizacja (Tydzień 6)

**Zadania:**
- [ ] Funkcjonalność usuwania linków (DELETE endpoint)
- [ ] Zadanie cykliczne wygasania (30 dni)
- [ ] Czyszczenie starych zdarzeń (7 dni)
- [ ] Testy jednostkowe (Jest)
- [ ] Testy integracyjne (Supertest)
- [ ] Optymalizacja zapytań SQL

**Rezultat:** Kompletny system z zarządzaniem i testami

### Faza 6: Wdrożenie i Monitoring (Tydzień 7-8)

**Zadania:**
- [ ] Konfiguracja produkcji (Railway/Cloud Run/Kubernetes)
- [ ] Zmienne środowiskowe (.env.production)
- [ ] SSL/TLS (Cloudflare)
- [ ] Monitoring (wybór narzędzia)
- [ ] Konfiguracja alertów
- [ ] Testy E2E (Playwright/Cypress)
- [ ] Dokumentacja API (OpenAPI/Swagger)
- [ ] README z instrukcją uruchomienia

**Rezultat:** System produkcyjny z monitoringiem

---

**Wersja Dokumentu:** 1.0
**Ostatnia Aktualizacja:** 2026-01-28
**Autor:** Kacper Gorski
**Status:** Gotowy do Implementacji

**Dokumenty Powiązane:**
- [Dokumentacja Techniczna](./tech-stack.md) - Architektura systemu, szczegóły techniczne
- [Dokument Wymagań Produktowych (PRD)](./prd.md) - Wymagania biznesowe, zakres produktu
- [Historie Użytkownika](./user-stories.md) - Szczegółowe user stories z kryteriami akceptacji
