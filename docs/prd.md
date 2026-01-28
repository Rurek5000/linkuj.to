# Dokument Wymagań Produktowych (PRD)
## Platforma do Skracania URL-i

---

## 1. Opis Problemu

Użytkownicy potrzebują prostego narzędzia do skracania długich URL-i oraz śledzenia podstawowych statystyk kliknięć w czasie rzeczywistym, bez konieczności rejestracji i skomplikowanych procesów.

## 2. Cele i Założenia

### Główne Cele
- Umożliwić każdemu użytkownikowi anonimowe skracanie URL-i
- Zapewnić analitykę w czasie rzeczywistym dla skróconych linków
- Zbudować prosty i intuicyjny interfejs użytkownika

### Metryki Sukcesu
- Szybkość generowania skróconego linku (< 500ms)
- Szybkość przekierowania (< 100ms)
- Wysoka dostępność systemu (> 99.5%)
- Wskaźnik blokowania złośliwych URL-i
- Liczba aktywnych linków w systemie

## 3. Zakres

### W Zakresie (MVP)
- Anonimowe skracanie URL-i
- Automatyczne generowanie krótkich kodów (np. abc123)
- Szybkie przekierowania w czasie rzeczywistym
- Panel z podstawową analityką (liczba kliknięć, kraj, znacznik czasu)
- Możliwość usuwania linków
- Automatyczne wygasanie linków po 30 dniach
- Ochrona przed spamem i złośliwymi linkami

### Poza Zakresem
- Rejestracja i logowanie użytkowników
- Niestandardowe krótkie kody (vanity URLs)
- Zaawansowana analityka (urządzenia, przeglądarki, miasta)
- Kody QR, kreator UTM
- API dla integracji zewnętrznych
- Plan premium/monetyzacja
- Grupowanie/tagowanie linków

## 4. Historie Użytkownika

> **Szczegółowe historie użytkownika dostępne są w osobnym dokumencie:** [User Stories](./user-stories.md)

### Podsumowanie Historii
- **HU-1:** Skracanie URL (Krytyczny - Faza 1)
- **HU-2:** Przekierowanie (Krytyczny - Faza 1)
- **HU-3:** Przeglądanie Statystyk (Wysoki - Faza 2)
- **HU-4:** Usuwanie Linku (Średni - Faza 3)
- **HU-5:** Automatyczne Wygasanie (Średni - Faza 3)

## 5. Wymagania Funkcjonalne

### 5.1 Skracanie URL
- Walidacja wejściowego URL (poprawny format, rozsądna długość)
- Weryfikacja bezpieczeństwa URL (ochrona przed złośliwymi linkami)
- Ochrona przed spamem i botami
- Generowanie unikalnego krótkiego kodu
- Natychmiastowe udostępnienie użytkownikowi skróconego linku

### 5.2 Przekierowania
- Szybkie przekierowanie na oryginalny URL
- Zliczanie kliknięć
- Obsługa błędów dla nieistniejących lub wygasłych linków
- Zbieranie podstawowych danych analitycznych (kraj, czas)

### 5.3 Analityka
- Odświeżanie statystyk co 5 minut
- Agregacja danych: liczba kliknięć w czasie, rozkład geograficzny
- Filtry czasowe (ostatnie 24h, 7 dni, 30 dni, cały okres)
- Przechowywanie historycznych danych analitycznych

### 5.4 Zarządzanie Linkami
- Możliwość usuwania linków przez administratora
- Automatyczne wygasanie linków po 30 dniach
- Zachowanie statystyk po usunięciu linku
- Codzienne czyszczenie wygasłych linków

### 5.5 Interfejs Użytkownika
- Formularz do wklejania URL
- Wyświetlanie skróconego linku z przyciskiem "Kopiuj"
- Panel analityczny z wykresami (liniowy - czas, słupkowy - kraje)
- Lista utworzonych linków z akcjami
- Responsywny design (mobile-first)

## 6. Doświadczenie Użytkownika

### 6.1 Strona Główna
- Czysty, minimalistyczny projekt
- Widoczne pole wprowadzania URL z tekstem zastępczym "Wklej tutaj swój długi URL"
- Przycisk "Skróć" (z weryfikacją antyspamową)
- Wyświetlanie wygenerowanego krótkiego linku z przyciskiem "Kopiuj"
- Link do panelu analitycznego (zobacz statystyki)

### 6.2 Panel
- URL w nagłówku (nawigacja okruszkowa)
- Sekcja: Łączna liczba kliknięć (duża liczba)
- Wykres: Kliknięcia w czasie (wykres liniowy, ostatnie 7/30 dni)
- Wykres: Najczęstsze kraje (poziomy wykres słupkowy)
- Znacznik czasu: "Ostatnia aktualizacja: 5 minut temu"
- Akcja: Przycisk usuwania linku

### 6.3 Stany Błędów
- Nieprawidłowy URL: "Proszę wprowadzić prawidłowy URL"
- Wykryto złośliwy URL: "Ten URL został oznaczony jako niebezpieczny"
- Link wygasły/usunięty: "Ten link nie jest już aktywny"
- Błąd serwisu: "Ups! Coś poszło nie tak. Spróbuj ponownie."

## 7. Fazy Rozwoju

### Faza 1: MVP - Podstawowa Funkcjonalność
**Cel:** Działające skracanie i przekierowania URL

**Funkcjonalności:**
- [ ] Formularz do skracania URL
- [ ] Generowanie krótkich linków
- [ ] Przekierowania z oryginalnych URL
- [ ] Ochrona przed spamem i złośliwymi linkami
- [ ] Podstawowa obsługa błędów

**Rezultat:** Użytkownik może skrócić URL i udostępnić go innym

### Faza 2: Analityka
**Cel:** Śledzenie i wizualizacja statystyk

**Funkcjonalności:**
- [ ] Zbieranie danych o kliknięciach
- [ ] Panel analityczny z wykresami
- [ ] Statystyki w czasie (wykresy liniowe)
- [ ] Rozkład geograficzny (wykresy słupkowe)
- [ ] Filtry czasowe (24h, 7d, 30d, wszystko)

**Rezultat:** Użytkownik widzi, ile razy link został kliknięty i skąd pochodzą odwiedzający

### Faza 3: Zarządzanie i Dopracowanie
**Cel:** Kompletny system z zarządzaniem cyklem życia linków

**Funkcjonalności:**
- [ ] Usuwanie linków
- [ ] Automatyczne wygasanie po 30 dniach
- [ ] Dopracowanie interfejsu użytkownika
- [ ] Responsywność mobilna
- [ ] Testowanie end-to-end
- [ ] Wdrożenie produkcyjne

**Rezultat:** W pełni działająca platforma gotowa do użycia

## 8. Ryzyka i Działania Zapobiegawcze

| Ryzyko | Wpływ na Produkt | Działanie Zapobiegawcze |
|--------|------------------|------------------------|
| **Spam/nadużycia** | Przeciążenie systemu, pogorszenie jakości usługi | Ochrona przed botami, limit linków na użytkownika, blokowanie podejrzanych IP |
| **Złośliwe URL** | Utrata zaufania użytkowników, problemy prawne | Automatyczna weryfikacja bezpieczeństwa URL przed skróceniem |
| **Kolizja krótkiego kodu** | Nadpisanie istniejącego linku, utrata danych | Sprawdzanie unikalności, system ponawiania generowania |
| **Niska adopcja** | Brak użytkowników, niewykorzystany potencjał | Prosty onboarding bez rejestracji, intuicyjny interfejs |
| **Awaria systemu** | Niedostępność usługi, utrata użytkowników | Mechanizmy zapasowe, monitoring, szybka reakcja na problemy |
| **Wzrost kosztów infrastruktury** | Nierentowność projektu | Automatyczne czyszczenie starych danych, optymalizacja wydajności |

## 9. Otwarte Pytania

- [ ] Subdomena/domena dla krótkich linków? (np. short.ly vs yourdomain.com/s/)
- [ ] Czy dodać możliwość zgłaszania złośliwych linków przez użytkowników?
- [ ] Czy wyświetlać publiczne statystyki dla wszystkich linków?
- [ ] Jakie dodatkowe funkcje priorytetyzować po MVP?

---

**Dokumenty Powiązane:**
- [Historie Użytkownika](./user-stories.md) - Szczegółowe user stories z kryteriami akceptacji
- [Dokumentacja Techniczna](./tech-stack.md) - Szczegóły implementacji, architektura systemu, stack technologiczny
