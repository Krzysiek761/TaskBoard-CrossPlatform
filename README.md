# TaskBoard - Cross-Platform Task Manager

**Przedmiot:** Projektowanie i programowanie aplikacji PWA i mobilnych cross-platform
**Uczelnia:** WSB Merito, Wrocław
**Autor:** Krzysztof

---

## 1. Opis aplikacji
TaskBoard to wszechstronna aplikacja do zarządzania zadaniami w zespole, wzorowana na tablicach Kanban. Celem projektu jest dostarczenie użytkownikom spójnego doświadczenia na różnych urządzeniach, umożliwiając śledzenie postępów, dodawanie nowych zadań oraz zarządzanie statusem projektów w czasie rzeczywistym.

## 2. Architektura systemu
System opiera się na architekturze klient-serwer i składa się z trzech głównych modułów:
* **Backend (REST API):** Centralny serwer logiki biznesowej udostępniający dane za pomocą zapytań HTTP.
* **Aplikacja PWA (Frontend):** Dostępna przez przeglądarkę, z obsługą trybu offline dzięki Service Workerom.
* **Aplikacja Mobile:** Multiplatformowa aplikacja mobilna (Android/iOS) komunikująca się z tym samym backendem.

## 3. Wybrana technologia
* **Backend:** Express.js (Node.js) + SQLite. Wybrano ze względu na asynchroniczność, wysoką wydajność I/O oraz przenośność bazy SQLite, co idealnie sprawdza się w środowisku deweloperskim i wdrożeniach chmurowych (wymuszono kompilację ze źródeł dla pełnej kompatybilności).
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
* **Kolorystyka:** Głęboki granat jako kolor bazowy, biel jako tło, akcenty w pastelowych odcieniach zieleni, żółci i czerwieni do oznaczania statusów.
* **Typografia:** Rodzina czcionek sans-serif (Inter / Roboto) dbająca o wysoką czytelność.
* **Komponenty:** Własne reużywalne karty zadań z zaokrąglonymi rogami i delikatnymi cieniami (współdzielone koncepcyjnie między PWA a aplikacją mobilną).

## 6. Opis funkcjonalności
* Obsługa kont użytkowników (rejestracja i logowanie).
* Pełna obsługa zadań (operacje CRUD).
* Zmiana statusu zadania (To Do, In Progress, Done).
* Tryb offline w PWA dzięki Service Workerom i cache'owaniu.
* Wykorzystanie natywnych funkcji w aplikacji mobilnej (geolokalizacja przy dodawaniu zadania).
* Bezpośrednia synchronizacja stanu przez wspólne REST API.

## 7. Zabezpieczenia
* **Uwierzytelnianie:** Oparte o JSON Web Tokens (JWT). Endpointy chronione są przed dostępem bez odpowiedniego nagłówka Authorization.
* **Hasła:** Przechowywane w bazie SQLite w formie zahashowanej (użyto bcrypt).
* **CORS:** Skonfigurowane polityki ograniczające żądania wyłącznie do autoryzowanych domen klienckich.
* **Walidacja wejścia:** Zapobieganie wstrzykiwaniu złośliwego kodu na etapie żądań HTTP.

## 8. Testowanie
Przeprowadzono testy manualne oraz jednostkowe endpointów API (przy użyciu narzędzia Postman). 
Znalezione i naprawione błędy: 
* Brak zgodności bibliotek C++ (GLIBC) na serwerach chmurowych rozwiązano poprzez zmianę wersji paczki `sqlite3` oraz wymuszenie kompilacji `--build-from-source`.
* Wyeliminowano problem z wygasaniem tokenu JWT poprzez poprawne przechwytywanie błędów po stronie klienta (PWA).

## 9. Zrzuty ekranu
*Poniżej można dodać bezpośrednie ścieżki do plików, jeśli zrzuty są w folderze /docs*
* Ekran logowania PWA
* Widok główny tablicy zadań (Desktop)
* Widok mobilny aplikacji w Expo Go

## 10. Instrukcja uruchomienia
**Środowisko Produkcyjne (Działające linki):**
* **Aplikacja PWA:** https://task-board-cross-platform.vercel.app
* **REST API (Backend):** https://taskboard-crossplatform.onrender.com
* **Aplikacja Mobile:** Zgodnie z wytycznymi, aplikację mobilną można uruchomić lokalnie wykorzystując Expo. Należy wejść do folderu `mobile`, wpisać `npx expo start` i zeskanować kod QR w aplikacji Expo Go na telefonie.

**Uruchomienie w środowisku deweloperskim (Lokalnie):**
1. Sklonuj repozytorium.
2. W folderze `backend` uruchom komendę: `npm install`, a następnie `npm start`.
3. W folderze `pwa` uruchom komendę: `npm install`, a następnie `npm run dev`.
4. W folderze `mobile` uruchom komendę: `npm install`, a następnie `npx expo start`.

## 11. Napotkane problemy
* **Problemy środowiskowe macOS:** Konieczność obejścia limitów `too many open files` w Watchmanie podczas uruchamiania Expo Go na systemie macOS.
* **Problemy z wdrożeniem (Deploy):** Błędy kompilacji natywnej biblioteki `sqlite3` na serwerach chmurowych (Render). Problem zażegnano poprzez downgrade paczki oraz manipulację flagami środowiska Node.js.

## 12. Możliwości rozwoju
* Wdrożenie powiadomień Push przypominających o terminach zadań.
* Zastosowanie WebSockets do odświeżania tablicy na żywo, gdy pracuje nad nią wielu użytkowników jednocześnie.
* Integracja Dark Mode z detekcją ustawień systemowych użytkownika.