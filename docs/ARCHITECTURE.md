# Architecture

## Monorepo

```
fswg/
├── frontend/          # Vite + React + TypeScript (Vercel)
├── backend/           # Express + MongoDB + Socket.IO (Render)
├── docs/              # This documentation
└── README.md          # Product overview & quick start
```

## Stacks

| Layer | Tech |
|-------|------|
| SPA | React, React Router, TanStack Query, Zustand, Tailwind |
| API | Node.js, Express, Mongoose |
| DB | MongoDB Atlas |
| Auth | JWT (HS512), httpOnly cookie, `sessionVersion` |
| Files | Multer local + UploadThing for vault |
| Jobs | Inngest |
| Realtime | Socket.IO |
| Push | Web Push (VAPID) for admins |

## Request path (API)

```
Client → CORS → optionalAuth → csrfGuard → botGuard → maintenanceGate
      → auditTrail → route handlers → error middleware
```

## Frontend feature layout

```
frontend/src/features/
├── admin/           # Admin CRM, activity, approvals
├── dashboard/       # Role dashboards + AdminActivityFeed
├── super/           # Command Center (Pulse, People, Security, …)
└── …                # Public marketing, auth, services
```

Super UI mounts at `/dashboard/super` behind a `super_admin` gate. Normal admins never see super-only activity (`superOnly` / `superStealth` on audit rows).

## Backend module layout

```
backend/src/
├── routes/          # Express routers mounted in server.ts
├── controllers/     # Feature controllers
├── modules/         # Domain modules (users, super, approvals, dashboard)
├── middleware/      # auth, CSRF, bot, maintenance, upload
├── models/          # Mongoose schemas
└── constants/       # roles, etc.
```

## Environments

| Env | Frontend | Backend |
|-----|----------|---------|
| Local | `vite` → `:5173` | `nodemon` / `tsx` → `:5000` |
| Prod | Vercel static SPA | Render Web Service |
| DB | — | MongoDB Atlas |

`CLIENT_URL` on the API must match the SPA origin(s) used in CORS.  
`VITE_API_BASE_URL` on the SPA must point at the API origin (including `/api` if that is how the client is configured — check `frontend` axios base URL).

## Data domains (high level)

| Domain | Models / concern |
|--------|------------------|
| Identity | User, JWT, sessionVersion, risk flags |
| CRM | Lead, Consultation, Client conversion |
| Applications | RentalApplication, AdvisorApplication |
| Content | Content, Service |
| Ops | AuditLog, Notification, Approval |
| Super | SystemSettings, Watchlist, BotBlock, Promo, Visitor geo |

## Related

- [API.md](./API.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [SUPER_ADMIN.md](./SUPER_ADMIN.md)
