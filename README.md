# TaskBoard - Cross-Platform Task Manager

## 1. Opis aplikacji
TaskBoard to wszechstronna aplikacja do zarządzania zadaniami w zespole, wzorowana na tablicach Kanban. Celem projektu jest dostarczenie użytkownikom spójnego doświadczenia na różnych urządzeniach, umożliwiając śledzenie postępów, dodawanie nowych zadań oraz zarządzanie statusem projektów w czasie rzeczywistym.

## 2. Architektura systemu
System opiera się na architekturze klient-serwer i składa się z trzech głównych modułów:
* **Backend (REST API):** Centralny serwer logiki biznesowej udostępniający dane za pomocą zapytań HTTP.
* **Aplikacja PWA (Frontend):** Dostępna przez przeglądarkę, z obsługą trybu offline dzięki Service Workerom.
* **Aplikacja Mobile:** Multiplatformowa aplikacja mobilna (Android/iOS) komunikująca się z tym samym backendem.

## 3. Wybrana technologia
* **Backend:** Express.js (Node.js) + SQLite. Wybrano ze względu na asynchroniczność, wysoką wydajność I/O oraz przenośność bazy SQLite, co idealnie sprawdza się w środowisku deweloperskim i szybkich wdrożeniach.
* **PWA:** React. Zapewnia komponentowe podejście, ułatwiając utrzymanie i skalowanie interfejsu.
* **Mobile:** React Native (Expo). Umożliwia współdzielenie logiki i wzorców projektowych z wersją PWA, znacznie przyspieszając proces developmentu obu platform.

## 4. Opis API
Główne endpointy:
* `POST /api/auth/register` - Rejestracja nowego użytkownika.
* `POST /api/auth/login` - Logowanie (zwraca token JWT).
* `GET /api/tasks` - Pobranie listy zadań przypisanych do użytkownika.
* `POST /api/tasks` - Utworzenie nowego zadania.
* `PUT /api/tasks/:id` - Aktualizacja statusu/treści zadania.
* `DELETE /api/tasks/:id` - Usunięcie zadania.

## 5. Design system
Interfejs obu klientów oparty jest o minimalistyczny, spójny design system:
* **Kolorystyka:** Głęboki granat jako kolor bazowy, biel jako tło, akcenty (np. statusy zadań) w pastelowych odcieniach zieleni, żółci i czerwieni.
* **Typografia:** Rodzina czcionek sans-serif (Inter / Roboto) dbająca o wysoką czytelność na małych i dużych ekranach.
* **Komponenty:** Własne reużywalne karty zadań z zaokrąglonymi rogami i delikatnymi cieniami.

## 6. Opis funkcjonalności
* Obsługa kont użytkowników (rejestracja/logowanie).
* Dodawanie, edycja, usuwanie zadań (CRUD).
* Zmiana statusu zadania (To Do, In Progress, Done).
* PWA: Tryb offline (cache'owanie zasobów).
* Mobile: Integracja z geolokalizacją (np. dodawanie lokalizacji do tworzonego zadania).
* Spójna synchronizacja danych między obiema platformami.

## 7. Zabezpieczenia
* **Uwierzytelnianie:** Oparte o tokeny JWT (JSON Web Tokens). Endpointy chronione przed dostępem bez nagłówka Authorization.
* **Hasła:** Przechowywane w bazie w formie zahashowanej (bcrypt).
* **Walidacja wejścia:** Sprawdzanie danych przesyłanych w ciele żądań POST/PUT, by zapobiec atakom typu SQL Injection/NoSQL Injection.
* **CORS:** Skonfigurowane polityki ograniczające żądania tylko z autoryzowanych domen klienckich.

## 8. Testowanie
Przeprowadzono testy manualne oraz jednostkowe endpointów przy użyciu Postmana. 
Zgłoszone i naprawione błędy: 
* Problem z wygasaniem tokenu JWT - dodano poprawne przechwytywanie błędu po stronie PWA.
* Optymalizacja re-renderowania w React Native podczas przewijania dużej listy zadań.

## 9. Zrzuty ekranu
*(Tu wkleisz linki do screenów, np. umieszczając screeny w folderze docs/ w repozytorium)*
- [Ekran główny PWA]
- [Ekran logowania Mobile]
- [Tablica zadań]

## 10. Instrukcja uruchomienia
**Linki produkcyjne:**
* REST API: [WKRÓTCE LINK DO RAILWAY/RENDER]
* PWA: [WKRÓTCE LINK DO VERCEL]
* Aplikacja Mobile: Skanuj kod QR w Expo Go z tego linku: [WKRÓTCE LINK DO EXPO]

**Uruchomienie lokalne:**
1. Sklonuj repozytorium.
2. W folderze `backend`: `npm install` -> `npm start`.
3. W folderze `pwa`: `npm install` -> `npm run dev`.
4. W folderze `mobile`: `npm install` -> `npx expo start`.

## 11. Napotkane problemy
* **Konfiguracja środowiska w macOS:** Problemy z limitami systemowymi `too many open files` w Watchmanie podczas odpalania Expo - rozwiązane przez modyfikację limitów i przeinstalowanie zależności.
* **Kompatybilność pakietów:** Zgrzyty przy dopasowywaniu wersji React Routera dla wspólnego wykorzystania komponentów nawigacyjnych.

## 12. Możliwości rozwoju
W przyszłości aplikacja mogłaby zostać wzbogacona o:
* Obsługę powiadomień Push (przypomnienia o upływających terminach zadań).
* Zmiany w czasie rzeczywistym z wykorzystaniem WebSockets (widoczność edycji tablicy na żywo, gdy pracuje nad nią wiele osób).
* Dodanie trybu Dark Mode oraz rozszerzenie opcji dostępu do geolokalizacji na etapie edycji zadania.
