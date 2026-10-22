# First Step Wealth Group — Documentation

Internal docs for the FSWG monorepo (`frontend/` + `backend/`).

| Document | Description |
|----------|-------------|
| [API.md](./API.md) | Full HTTP API reference (routes, auth, roles) |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Monorepo layout, stacks, request pipeline |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | JWT, cookies, sessions, impersonation |
| [ROLES.md](./ROLES.md) | Roles and permission groups |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Env vars for local, Render, Vercel |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | GitHub → Render + Vercel |
| [SECURITY.md](./SECURITY.md) | Hardening, stealth, audit logging |
| [SUPER_ADMIN.md](./SUPER_ADMIN.md) | Command Center bootstrap & playbooks |
| [ADMIN_ALERTS.md](./ADMIN_ALERTS.md) | Real-time admin alerts & Web Push |

## Quick links

- Frontend (Vite): `frontend/` — default local `http://localhost:5173`
- Backend (Express): `backend/` — default local `http://localhost:5000`
- API base path: `/api`
- Super Admin UI: `/dashboard/super`
- Public system banner: `GET /api/system/public`
- Health: `GET /api/health`

## Conventions

- **Auth:** Prefer httpOnly cookie `jwt`; Bearer token accepted as fallback.
- **CSRF:** Mutating cookie-authenticated requests must send `X-Requested-With: XMLHttpRequest` (the SPA axios client does this).
- **Roles:** `super_admin` inherits all `admin` permissions and is hidden from normal admin surfaces (stealth).
- **Secrets:** Never commit `.env`. Use `.env.example` files only.
