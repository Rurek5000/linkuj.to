# Historie Użytkownika
## Platforma do Skracania URL-i

---

## HU-1: Skracanie URL

**Jako** użytkownik  
**Chcę** wkleić długi URL i otrzymać krótki link  
**Aby** móc łatwo go udostępnić

### Kryteria Akceptacji
- Formularz przyjmuje dowolny poprawny URL
- System generuje losowy krótki kod (np. abc123)
- Użytkownik otrzymuje pełny krótki link (np. short.ly/abc123)
- Link można skopiować jednym kliknięciem
- System weryfikuje, że to nie bot
- System sprawdza bezpieczeństwo URL przed skróceniem

### Priorytet
🔴 **Krytyczny** - MVP Faza 1

### Oszacowanie
**Story Points:** 8

---

## HU-2: Przekierowanie

**Jako** osoba klikająca skrócony link  
**Chcę** być automatycznie przekierowana na oryginalny URL  
**Aby** uzyskać dostęp do treści

### Kryteria Akceptacji
- Natychmiastowe przekierowanie na oryginalny URL
- Przekierowanie działa szybko (< 100ms)
- Kliknięcie jest zliczane i zapisywane
- Link nieaktywny/wygasły pokazuje komunikat błędu

### Priorytet
🔴 **Krytyczny** - MVP Faza 1

### Oszacowanie
**Story Points:** 5

---

## HU-3: Przeglądanie Statystyk

**Jako** twórca aplikacji  
**Chcę** zobaczyć statystyki kliknięć  
**Aby** monitorować ruch na wygenerowanych linkach

### Kryteria Akceptacji
- Panel pokazuje: łączną liczbę kliknięć, wykres w czasie, rozkład geograficzny (kraje)
- Dane odświeżają się co 5 minut
- Statystyki są dostępne przez cały czas życia linku

### Priorytet
🟡 **Wysoki** - Faza 2

### Oszacowanie
**Story Points:** 13

---

## HU-4: Usuwanie Linku

**Jako** twórca aplikacji  
**Chcę** móc usunąć jakikolwiek link  
**Aby** przestał działać

### Kryteria Akceptacji
- Przycisk "Usuń" przy każdym linku
- Potwierdzenie usunięcia
- Po usunięciu link przestaje działać natychmiast
- Statystyki są zachowane

### Priorytet
🟢 **Średni** - Faza 3

### Oszacowanie
**Story Points:** 3

---

## HU-5: Automatyczne Wygasanie

**Jako** system  
**Chcę** automatycznie dezaktywować linki starsze niż 30 dni  
**Aby** zarządzać przestrzenią w bazie danych

### Kryteria Akceptacji
- Zadanie cykliczne sprawdza codziennie linki starsze niż 30 dni
- Linki są oznaczane jako wygasłe (usunięcie miękkie)
- Próba otwarcia wygasłego linku pokazuje komunikat

### Priorytet
🟢 **Średni** - Faza 3

### Oszacowanie
**Story Points:** 5

---

## Legenda Priorytetów

- 🔴 **Krytyczny** - Niezbędne do uruchomienia MVP
- 🟡 **Wysoki** - Ważne dla podstawowej funkcjonalności
- 🟢 **Średni** - Przydatne, ale można odłożyć
- ⚪ **Niski** - Nice-to-have

## Suma Story Points

**Faza 1 (MVP):** 13 SP  
**Faza 2 (Analityka):** 13 SP  
**Faza 3 (Zarządzanie):** 8 SP  

**TOTAL:** 34 SP

---

**Wersja Dokumentu:** 1.0  
**Ostatnia Aktualizacja:** 2026-01-28  
**Autor:** Kacper Gorski

**Dokumenty Powiązane:**
- [Dokument Wymagań Produktowych (PRD)](./prd.md) - Wymagania biznesowe, zakres produktu
- [Dokumentacja Techniczna](./tech-stack.md) - Szczegóły implementacji, architektura systemu
