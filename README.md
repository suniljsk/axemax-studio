# AxeMax Studio — Full-stack starter application

A portfolio CMS with a React + TypeScript website, Spring Boot REST API, PostgreSQL database, and Expo / React Native Android client.

## Included
- Public portfolio projects API and website
- Admin login and project CRUD API
- PostgreSQL + Flyway schema migrations
- Spring Security with BCrypt and JWT access tokens
- Contact form endpoint
- React web app with project filters and admin project form
- Expo mobile app that consumes the same API
- Docker Compose for PostgreSQL and backend
- Backend unit tests and GitHub Actions CI workflow

## Requirements
- Java 21
- Maven 3.9+
- Node.js 20+
- Docker Desktop
- Android Studio (optional, for Android emulator)

## Quick start: backend + database
1. Copy `.env.example` to `.env` and change `JWT_SECRET` and `ADMIN_PASSWORD`.
2. Start the database and API:
   ```bash
   docker compose up --build
   ```
3. API base URL: `http://localhost:8080`
4. Swagger UI: `http://localhost:8080/swagger-ui/index.html`
5. Login endpoint: `POST /api/v1/auth/login`
6. Default admin email/password are set from `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables. Change them before use.

## Quick start: web
```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:5173`. The Vite dev server proxies `/api` to `http://localhost:8080`.

## Quick start: Android app
```bash
cd apps/mobile
npm install
npx expo start
```
Set `EXPO_PUBLIC_API_URL` if the API is not reachable at `http://10.0.2.2:8080` from the Android emulator.
- Android emulator: `http://10.0.2.2:8080`
- Physical device: use your computer's LAN IP, e.g. `http://192.168.1.10:8080`
- Production: use your deployed HTTPS API URL.

## API endpoints
- `GET /api/v1/projects?page=0&size=12&technology=Java`
- `GET /api/v1/projects/{slug}`
- `POST /api/v1/auth/login`
- `POST /api/v1/admin/projects` (Bearer token)
- `PUT /api/v1/admin/projects/{id}` (Bearer token)
- `DELETE /api/v1/admin/projects/{id}` (Bearer token)
- `POST /api/v1/contact`

## Important production checklist
This is a working starter, not a fully audited production deployment. Before public launch:
- Use HTTPS and a strong unique JWT secret (at least 32 random bytes).
- Set secrets using your host's secret manager; never commit `.env`.
- Add rate limiting and spam protection to the contact endpoint and login.
- Consider refresh-token rotation/revocation for longer admin sessions.
- Configure CORS for only your production web domain.
- Add email delivery, backups, monitoring, and error tracking.
- Use managed PostgreSQL and verify backups/restores.
- Review all security settings and dependency versions before launch.

## Repository structure
```text
apps/web       React + TypeScript + Vite
apps/mobile    Expo / React Native
backend        Spring Boot API
infra          Docker-related notes
.github        CI workflow
```
