# AxeMax Studio — System Design

## 1. Purpose and scope

AxeMax Studio is a portfolio/CMS starter with:
- **Web client:** React, TypeScript and Vite.
- **Mobile client:** Expo / React Native Android starter.
- **API:** Java 21 and Spring Boot REST API.
- **Persistence:** PostgreSQL, with Flyway-managed schema migrations.
- **Authentication:** Spring Security, BCrypt password hashing and JWT access tokens for admin endpoints.
- **Local orchestration:** Docker Compose for PostgreSQL and the backend.
- **Quality gate:** GitHub Actions CI for build and test checks.

This document describes the implementation that exists today and marks planned capabilities separately. It is not a claim that the application is deployed to production.

## 2. Architecture principles

1. **API-first:** Web and mobile clients use the same versioned REST API.
2. **Clear boundaries:** UI, HTTP/API, business logic, persistence and database concerns remain separate.
3. **Secure by configuration:** Secrets come from environment variables; production must use unique values and HTTPS.
4. **Schema evolution:** Flyway owns database migrations; Hibernate validates rather than automatically changing the schema.
5. **Deployable components:** The web build is static assets; the API and PostgreSQL run as separate services.
6. **Document reality:** Browser-local portfolio drafts and print-to-PDF are current behavior; account-backed portfolios and shareable URLs are future work.

## 3. System context

### Actors and external systems

| Actor / system | Responsibility |
|---|---|
| Visitor | Browses portfolio projects, filters projects, and uses the portfolio builder |
| Administrator | Signs in and manages portfolio project records |
| Web client | React SPA served by a static web server in production |
| Android client | Expo / React Native app using the shared API |
| REST API | Validates requests, applies business rules, authorizes protected actions and returns JSON |
| PostgreSQL | Persists API-managed records |
| GitHub Actions | Runs automated build and test checks |

## 4. Logical architecture

### Web client
- React + TypeScript single-page application.
- Vite provides the local development server and proxies `/api` to the backend.
- In production, serve the compiled `apps/web/dist` directory with a static web server such as Nginx.
- Use relative `/api/...` requests when web and API share the same origin.
- The portfolio builder currently stores drafts in browser `localStorage`; its PDF action uses the browser print dialog.

### Mobile client
- Expo / React Native Android client under `apps/mobile`.
- Configures the API origin through `EXPO_PUBLIC_API_URL`.
- Android emulator development can use `http://10.0.2.2:8080`; a physical device needs a reachable host/LAN address.
- Production builds must use the deployed HTTPS API origin.

### Backend API
- Spring Boot application listens on port `8080`.
- API resources are versioned under `/api/v1`.
- Spring Security protects administrative operations.
- Login returns a JWT access token; clients send it as `Authorization: Bearer <token>` for protected routes.
- The health endpoint is exposed through Spring Boot Actuator. Verify the exact deployed health URL against the current application configuration.

### Persistence
- PostgreSQL 16 Alpine is the database image used by the Compose setup.
- The backend connects to the Compose service name `postgres` on port `5432`.
- A named Docker volume `axemax_pgdata` preserves database files across container recreation.
- Flyway applies schema migrations; JPA/Hibernate uses `ddl-auto: validate`.
- The database should not be exposed publicly in a production deployment.

## 5. Current API surface

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/v1/projects?page=0&size=12&technology=Java` | List/filter projects with pagination | Public |
| GET | `/api/v1/projects/{slug}` | Retrieve a project by slug | Public |
| POST | `/api/v1/auth/login` | Authenticate administrator | Public endpoint; credentials required |
| POST | `/api/v1/admin/projects` | Create a project | Admin JWT |
| PUT | `/api/v1/admin/projects/{id}` | Update a project | Admin JWT |
| DELETE | `/api/v1/admin/projects/{id}` | Delete a project | Admin JWT |
| POST | `/api/v1/contact` | Submit a contact message | Public endpoint |

Treat this table as a high-level contract; confirm DTO fields, validation rules, response codes and pagination metadata in the controller/API implementation before integrating a new client.

## 6. Main request flows

### Public project browsing
1. A visitor opens the web or mobile client.
2. The client requests the public projects endpoint.
3. The API validates query parameters and obtains project data through its service/persistence layers.
4. PostgreSQL returns matching records.
5. The API responds with JSON and the client renders the result.

### Administrator project management
1. The administrator submits credentials to the login endpoint.
2. The API validates credentials and issues a short-lived JWT access token.
3. The client sends the token in the Authorization header for admin project requests.
4. Spring Security validates the token before the protected controller runs.
5. The API validates the operation, persists the change and returns the result.

### Contact form
1. The visitor submits the contact form.
2. The API validates the request and handles the contact submission.
3. The API returns a success or validation/error response.
4. Email delivery is **not documented as implemented**; add an email provider/service if delivery notifications are required.

### Portfolio builder
1. The visitor edits profile and portfolio sections in the browser.
2. The React UI updates the preview and saves drafts in that browser's `localStorage`.
3. The PDF action opens the browser print dialog; the visitor chooses **Save as PDF**.
4. Draft synchronization, user accounts for portfolio owners, public share URLs and server-generated PDF files are planned features, not current capabilities.

## 7. Data and persistence design

PostgreSQL is the system of record for records managed by the backend. The exact table definitions are owned by the Flyway SQL migrations in the repository.

Design rules:
- Add schema changes as new, ordered Flyway migrations; do not edit an already-applied migration in a deployed environment.
- Keep database credentials out of source control.
- Use constraints and indexes that reflect actual query and uniqueness requirements.
- Validate request payloads at the API boundary and enforce important invariants in the service/database layers.
- Back up PostgreSQL and periodically test restoring a backup.
- Browser `localStorage` portfolio drafts are client-local and are not a substitute for database backups.

## 8. Security model

### Implemented foundations
- Spring Security for API authorization.
- BCrypt for password hashing.
- JWT access tokens for administrative requests.
- Environment-driven configuration for the JWT secret, admin credentials and CORS origins.
- Actuator health/info exposure is restricted by application configuration.

### Required before public production use
- Replace every sample/default secret and admin credential with strong unique values.
- Keep `.env` out of Git; use the hosting platform's secret management where available.
- Terminate TLS and redirect HTTP to HTTPS.
- Restrict CORS to the deployed web origins; CORS is not an authentication mechanism.
- Do not publish PostgreSQL port 5432 to the internet.
- Bind the backend to localhost when Nginx is the public reverse proxy, or keep it on a private container network.
- Add rate limiting and abuse/spam protection to login and contact submission.
- Review JWT expiration, signing-key rotation, logout/revocation requirements, input validation, authorization rules and dependency vulnerabilities.
- Avoid returning secrets or sensitive data in logs and API errors.
- Configure backups, monitoring and alerting.

## 9. Deployment architecture

Recommended first deployment for the current project:
- **DNS:** `axemaxstudio.com` and optionally `www.axemaxstudio.com` point to the server.
- **Nginx:** Serves the compiled React SPA, provides SPA fallback routing, terminates HTTPS and reverse-proxies `/api/` to the backend.
- **Spring Boot container:** Exposes port 8080 only to the host loopback/private network.
- **PostgreSQL container:** Accessible only to the backend over the private Docker network.
- **TLS:** Use a trusted certificate and verify renewal.
- **Operations:** Keep secrets on the server, persist PostgreSQL data, configure backups and deploy from reviewed commits on `main`.

For production Compose, remove the PostgreSQL `ports: "5432:5432"` mapping. If Nginx runs on the host, bind the API mapping to `127.0.0.1:8080:8080` rather than all interfaces.

## 10. Reliability, observability and recovery

- Use the configured container/database health check to gate backend startup.
- Expose and monitor the application health endpoint without exposing unnecessary management endpoints.
- Collect Nginx access/error logs and backend container logs; establish retention and alerting.
- Back up the database before releases that change schema or data.
- Test restore procedures instead of assuming that a successful backup is recoverable.
- Make deployments repeatable: pull a known Git commit, build, run tests, apply reviewed migrations, verify health and smoke-test critical endpoints.
- Define a rollback approach for application images and database migrations; database schema rollback may require a forward-fix.

## 11. Scalability path

Start with a modular monolith and one PostgreSQL instance. Do not introduce microservices until there is a measured need.

Potential future steps:
1. Move PostgreSQL to a managed database with automated backups.
2. Add CDN/static hosting for the web build if traffic warrants it.
3. Add object storage for uploaded images or generated documents.
4. Persist user-owned portfolio drafts behind authenticated APIs.
5. Add cache only for measured read bottlenecks and define invalidation rules.
6. Add background jobs for email, PDF generation or media processing if these features are implemented.
7. Add centralized logs, metrics, traces, alerting and a documented recovery objective.

## 12. Known gaps / future design work

- User registration and authentication for portfolio owners.
- Server-side portfolio persistence and ownership/authorization rules.
- Public shareable portfolio URLs and visibility controls.
- Direct server-generated PDF files.
- Contact email delivery and abuse protection.
- Production monitoring, backup automation and recovery testing.
- A full threat model, load testing and security review.

These are recommendations or planned capabilities; do not assume they already exist.

## 13. Related documents

- [Architecture diagrams](./diagrams.md)
- [Architecture decisions](./decisions.md)
- [Repository README](../../README.md)
