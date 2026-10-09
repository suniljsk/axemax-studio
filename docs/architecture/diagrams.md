# AxeMax Studio — Architecture Diagrams

These Mermaid diagrams document the current high-level implementation. Planned capabilities are labeled as such.

## 1. System context

```mermaid
flowchart LR
    Visitor[Visitor] --> Web[React + TypeScript Web]
    Admin[Administrator] --> Web
    Visitor --> Mobile[Expo / React Native Android]
    Admin --> Mobile
    Web -->|HTTPS / JSON| API[Spring Boot REST API]
    Mobile -->|HTTPS / JSON| API
    API -->|JDBC / JPA| DB[(PostgreSQL)]
    Dev[Developer] --> Repo[GitHub Repository]
    Repo --> CI[GitHub Actions CI]
    CI -->|Build and test feedback| Dev
```

## 2. Production deployment (recommended)

```mermaid
flowchart TB
    Browser[Browser] -->|HTTPS 443| Nginx[Nginx reverse proxy]
    Android[Android app] -->|HTTPS API calls| Nginx
    Nginx -->|Static assets / SPA fallback| Web[React build files]
    Nginx -->|/api/* reverse proxy| API[Spring Boot container :8080]
    API -->|Private Docker network :5432| DB[(PostgreSQL container)]
    DB --- Volume[(Persistent database volume)]
    Cert[TLS certificate and renewal] -.-> Nginx
```

The diagram describes the recommended deployment topology, not an already-live deployment. PostgreSQL should have no public port mapping; the API should only be reachable through the reverse proxy/private network.

## 3. Runtime containers

```mermaid
flowchart LR
    subgraph Clients
        W[Web SPA]
        M[Android client]
    end
    subgraph Host_or_private_network[Deployment host / private network]
        R[Reverse proxy]
        A[Spring Boot API]
        P[(PostgreSQL)]
    end
    W -->|/api/v1/*| R
    M -->|HTTPS API URL| R
    R --> A
    A --> P
```

## 4. Admin authentication and protected project changes

```mermaid
sequenceDiagram
    actor Admin
    participant Client as Web or mobile client
    participant API as Spring Boot API
    participant Security as Spring Security / JWT
    participant DB as PostgreSQL

    Admin->>Client: Enter credentials
    Client->>API: POST /api/v1/auth/login
    API->>DB: Load administrator/auth data as implemented
    API-->>Client: JWT access token
    Client->>API: POST /api/v1/admin/projects + Bearer token
    API->>Security: Authenticate and authorize token
    Security-->>API: Request permitted
    API->>DB: Persist project change
    DB-->>API: Commit result
    API-->>Client: JSON response
```

The exact authentication lookup and token-validation implementation should be confirmed in backend code; the diagram shows the intended high-level flow.

## 5. Public project read flow

```mermaid
sequenceDiagram
    actor Visitor
    participant Client as React / Expo client
    participant API as REST API
    participant Service as Project service
    participant DB as PostgreSQL

    Visitor->>Client: Open projects or apply filters
    Client->>API: GET /api/v1/projects?page=0&size=12
    API->>Service: Validate and process request
    Service->>DB: Query matching projects
    DB-->>Service: Project records
    Service-->>API: Project result
    API-->>Client: JSON response
    Client-->>Visitor: Render projects
```

## 6. CI workflow (conceptual)

```mermaid
flowchart LR
    Change[Push or pull request] --> CI[GitHub Actions]
    CI --> Frontend[Install / lint or test / build web]
    CI --> Backend[Compile and test Spring Boot]
    Frontend --> Result{Checks pass?}
    Backend --> Result
    Result -->|Yes| Ready[Ready for review / merge]
    Result -->|No| Fix[Review failure and fix]
    Fix --> Change
```

Check the workflow file for the exact current jobs and triggers. This diagram is a high-level representation of the repository's CI purpose, not a guarantee that every suggested check is configured.
