# Deployment notes

Suggested initial deployment:
- Web: Vercel, Netlify, or another static host.
- Backend: any Docker/container host supporting Java containers.
- Database: managed PostgreSQL.

Set `VITE_API_BASE_URL` only if you update the web API client to use an explicit base URL; the included local Vite proxy is for development. For production, configure the host's rewrite/proxy so `/api/*` reaches the Spring Boot API, or add an explicit environment-based API base URL in `apps/web/src/App.tsx`.

Never deploy with sample credentials or the default JWT secret. Restrict CORS to your production domain. Enable HTTPS and database backups.
