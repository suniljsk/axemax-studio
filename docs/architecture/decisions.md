# AxeMax Studio — Architecture Decision Records

This file records the main design choices for the current starter. It is intentionally concise and can be extended as the application evolves.

## ADR-001: React + TypeScript + Vite for the web client

**Status:** Accepted

**Decision:** Use a React single-page application written in TypeScript and built with Vite.

**Why:** Fast local feedback, typed UI code, static production assets and a mature ecosystem.

**Consequences:** Client-side routes need SPA fallback in production. Secrets must never be embedded in frontend environment variables. Browser-only data such as `localStorage` is device/browser specific.

## ADR-002: Spring Boot REST API

**Status:** Accepted

**Decision:** Expose application capabilities through a Java 21 / Spring Boot REST API under `/api/v1`.

**Why:** A single API contract can serve the web and Android clients and allows API behavior to be tested independently of UI code.

**Consequences:** Validate request DTOs, define stable response/error formats, document endpoints and preserve backward compatibility when changing the public contract.

## ADR-003: PostgreSQL with Flyway migrations

**Status:** Accepted

**Decision:** Use PostgreSQL for backend-managed persistent data and Flyway for schema changes.

**Why:** Relational constraints and transactions fit project/CMS data, while migrations make schema evolution repeatable.

**Consequences:** Keep migrations ordered and immutable after deployment. Back up data and test restores. JPA schema mode is `validate`, so migrations must create the schema expected by entities.

## ADR-004: JWT access tokens for admin APIs

**Status:** Accepted

**Decision:** Protect administrative routes with Spring Security and JWT access tokens; use BCrypt for password hashing.

**Why:** The web and mobile clients can authenticate against the same API without server-side session affinity.

**Consequences:** Secure signing keys and credentials, set sensible expiration, validate tokens on every protected request, and define revocation/rotation strategy before longer-lived sessions are needed. JWT does not replace authorization checks.

## ADR-005: Docker Compose for local API and database

**Status:** Accepted for development / starter deployment

**Decision:** Run PostgreSQL and the backend as Compose services for repeatable local setup.

**Why:** Developers can bring up the API/database with a small number of commands and consistent service networking.

**Consequences:** Use environment-specific configuration. For production, do not publish PostgreSQL to the internet; use private networking and strong secrets. A single host remains a single point of failure.

## ADR-006: Nginx as the initial production entry point

**Status:** Proposed for first deployment

**Decision:** Serve static web assets and reverse-proxy `/api/` to the Spring Boot API from Nginx, with HTTPS enabled.

**Why:** The web and API can share an origin, simplifying routing and reducing unnecessary CORS complexity.

**Consequences:** Configure SPA fallback, proxy headers, certificate renewal, HTTP-to-HTTPS redirect and restricted backend/database ports. This topology is a recommendation and is not evidence of an existing deployment.

## ADR-007: Keep portfolio builder drafts in browser storage for the first iteration

**Status:** Accepted for current iteration

**Decision:** Keep the portfolio builder's drafts in browser `localStorage` and use the browser's print dialog for PDF export.

**Why:** It enables a useful first iteration without requiring accounts, server-side storage or a PDF-generation service.

**Consequences:** Drafts do not follow the user to another browser/device and are not backed up by the server. User accounts, server persistence, public portfolio URLs and server-generated PDFs require a separate design and implementation.

## ADR-008: Start as a modular monolith

**Status:** Accepted

**Decision:** Keep the API in one Spring Boot deployable rather than splitting it into microservices.

**Why:** The current product scope does not justify distributed deployment, service discovery, inter-service authentication or distributed tracing complexity.

**Consequences:** Maintain clear package/module boundaries and testability. Revisit service extraction only when independent scaling, team ownership or operational evidence warrants it.
