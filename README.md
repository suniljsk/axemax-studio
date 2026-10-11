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

## System design and architecture

Architecture documentation is maintained under [docs/architecture](docs/architecture/):
- [System design](docs/architecture/system-design.md) — components, API surface, request flows, security, persistence, deployment, reliability, and future gaps.
- [Architecture diagrams](docs/architecture/diagrams.md) — Mermaid system context, deployment, runtime, authentication, project-read and CI flows.
- [Architecture decision records](docs/architecture/decisions.md) — rationale and consequences for the main technology choices.

These documents distinguish current implementation from proposed production deployment and future features.

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

## User accounts, verification and welcome email

The web app provides separate **Studio admin** and **Sign in / Join** entry points. Public project browsing remains available, while the portfolio builder prompts visitors to sign in or create a user account.

User registration collects a username, email address, phone number and password. Before user login is allowed, the account must complete both:
1. Email confirmation using a link that expires after 24 hours.
2. Phone confirmation using a six-digit SMS code that expires after 10 minutes (up to five code attempts).

After both are verified, the API sends a **Welcome to AxeMax Studio!** email. Admin access remains separate and is configured using `ADMIN_EMAIL` and `ADMIN_PASSWORD`; public registration always creates the `USER` role and cannot grant admin access.

### Required provider configuration

Copy `.env.example` to `.env` and configure a real SMTP provider and Twilio SMS credentials before testing registration. The example SMTP host/port are development placeholders and do not send mail by themselves.

- `APP_PUBLIC_BASE_URL`: frontend base URL used in the email verification link (for local development, `http://localhost:5173`).
- `MAIL_FROM`: sender address permitted by your SMTP provider.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_AUTH`, `SMTP_STARTTLS`: outgoing email provider settings.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`: Twilio credentials and sender number for SMS.
- Keep provider credentials in `.env` or your deployment secret manager; never commit them.

Phone numbers must be entered in international E.164 format, for example `+919876543210`. A Twilio account may require destination-number verification while it is in trial mode.

### Authentication endpoints

- `POST /api/v1/auth/user/register` — create an unverified user and send email/SMS verification.
- `GET /api/v1/auth/user/verify-email?token=...` — confirm email from the verification link.
- `POST /api/v1/auth/user/verify-phone` — JSON body: `{"identifier":"username-or-email","code":"123456"}`.
- `POST /api/v1/auth/user/login` — JSON body: `{"identifier":"username-or-email","password":"..."}`; only fully verified users receive a USER JWT.
- `POST /api/v1/auth/login` — existing admin login.

The initial portfolio builder still stores drafts in the current browser's `localStorage`; account-backed cloud portfolios and public sharing are not implemented yet. User registration authenticates the user but does not imply that portfolio drafts are synced to PostgreSQL.

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


## Portfolio builder (web)

The public website includes a guided portfolio builder for visitors:
- Edit profile details, contact links, summary, skills, experience, projects, education, and certifications.
- Preview changes live in the Modern, Minimal, and Developer layouts.
- Switch the preview between dark and light workspace themes.
- Draft content is saved locally in the current browser using `localStorage`; it is not yet synced to a user account or the backend.
- Choose **Download PDF** to open the browser print dialog, then select **Save as PDF**. Print styling hides the editor and exports the portfolio preview on A4 pages.

### Test the portfolio builder
1. Start the API/database using the backend quick-start instructions (the landing page also works in preview mode without the API).
2. Start the web app with `cd apps/web && npm install && npm run dev`.
3. Select **Build portfolio**, edit the profile and projects, change a template, and verify the preview updates.
4. Select **Download PDF** and choose **Save as PDF**.
5. Run `npm run build` and `npm test` in `apps/web`.

Note: this is the first public builder iteration. Account registration, cloud-saved user portfolios, public shareable portfolio URLs, and direct server-generated PDF files are planned follow-up features; the current PDF export uses the browser's print-to-PDF flow.
