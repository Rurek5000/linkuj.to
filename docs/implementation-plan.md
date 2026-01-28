# Plan Implementacji
## Platforma do Skracania URL-i

---

## Fazy Implementacji

### Faza 1: Infrastruktura i Podstawowe Serwisy (Tydzień 1-2)

**Zadania:**
- [ ] Konfiguracja Docker Compose (PostgreSQL, Redis, pgAdmin)
- [ ] Inicjalizacja projektu Astro 5
- [ ] Konfiguracja TypeScript (strict mode)
- [ ] Schemat bazy danych (migracje Prisma/TypeORM)
- [ ] Serwis URL - implementacja endpointu POST /api/shorten
- [ ] Generowanie krótkich kodów z obsługą kolizji
- [ ] Implementacja pamięci podręcznej Redis

**Rezultat:** Działające skracanie URL bez analityki i zabezpieczeń

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
