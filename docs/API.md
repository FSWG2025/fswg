# API Reference

Base URL: `{API_ORIGIN}/api`  
Local default: `http://localhost:5000/api`

All JSON responses use `Content-Type: application/json` unless noted. Errors typically return `{ message: string }`.

## Global middleware (order)

Applied to `/api/*` before route handlers:

1. **optionalAuth** — attach `req.user` if a valid JWT is present
2. **csrfGuard** — cookie sessions require `X-Requested-With` on mutating methods
3. **botGuard** — scores / blocks abusive public traffic
4. **maintenanceGate** — when maintenance is on, non-super callers get `503` (allowlisted routes still work)
5. **auditTrail** — records successful mutating calls to the activity log

Root (outside `/api`):

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | Platform OK message |
| GET | `/robots.txt` | Public | Crawler rules |
| GET | `/sitemap.xml` | Public | Sitemap |
| GET | `/api/health` | Public | `{ ok: true, service: "fswg-api" }` |

UploadThing (if `UPLOADTHING_TOKEN` set): `/api/uploadthing`  
Inngest: `/api/inngest`

---

## Auth headers / cookies

| Mechanism | Detail |
|-----------|--------|
| Cookie | `jwt` (httpOnly, SameSite, Secure in production) |
| Header | `Authorization: Bearer <token>` |
| CSRF | `X-Requested-With: XMLHttpRequest` on POST/PUT/PATCH/DELETE when using cookies |

Role abbreviations used below:

- **Public** — no auth
- **Auth** — any logged-in user
- **Admin+** — `admin` or `super_admin` (and groups that include them)
- **Super** — `super_admin` only
- **CRM / Lead / …** — see [ROLES.md](./ROLES.md)

---

## System — `/api/system`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/public` | Public | Maintenance banner, feature flags safe for clients |
| GET | `/health` | Public | Deeper health (deploy SHA when set) |
| GET | `/promos` | Optional | Active public promos |

---

## Users — `/api/users`

Rate limits: login/register **10 / 60s**; forgot/reset **5 / 300s**.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | Public (optionalAuth) | Self-register; staff create when caller is admin |
| POST | `/login` | Public | Returns user + sets JWT cookie |
| POST | `/logout` | Optional | Clears cookie / session |
| POST | `/forgot-password` | Public | Email reset link |
| POST | `/reset-password/:token` | Public | Set new password |
| GET | `/profile` | Auth | Current user |
| PATCH | `/profile` | Auth | Update own profile |
| GET | `/consultants` | Auth | List consultants |
| PUT | `/change-password` | Auth | Change password |
| GET | `/` | USER_MANAGE | List users (filters/pagination) |
| GET | `/export` | USER_ADMIN | Export users |
| GET | `/:id` | USER_MANAGE | User by id |
| PUT | `/:id` | USER_MANAGE | Update user |
| DELETE | `/:id` | USER_ADMIN | Delete user |

---

## Leads — `/api/leads`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Public (8/min) | Create lead (blocked if `leadCapture` flag off) |
| GET | `/` | LEAD | List leads |
| GET | `/:id` | LEAD | Lead detail (IDOR-scoped) |
| PATCH | `/:id` | LEAD | Update lead |
| DELETE | `/:id` | Admin+ | Delete lead |
| PATCH | `/:id/convert` | LEAD | Convert to client |
| PATCH | `/bulk/assign` | LEAD_BULK | Bulk assign |

---

## Visitors — `/api/visitors`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/track` | Public | Analytics beacon |
| GET | `/stats` | Admin+ | Aggregate stats |
| GET | `/` | Admin+ | List visitors |

---

## Consultations — `/api/consultations`

All routes require auth.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Auth | Book consultation |
| GET | `/` | Auth | List (scoped by role) |
| GET | `/stats` | CRM | Stats |
| GET | `/:id` | Auth | Detail |
| PATCH | `/:id` | Auth | Update |
| DELETE | `/:id` | Auth | Cancel |

---

## Rental applications — `/api/rental-applications`

All routes require auth.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Auth | Submit application |
| GET | `/` | Auth | List (scoped) |
| GET | `/:id` | Auth | Detail |
| PATCH | `/:id` | RENTAL_STAFF | Update status |
| PATCH | `/:id/request-info` | RENTAL_STAFF | Request more info |
| DELETE | `/:id` | RENTAL_DELETE | Delete |

---

## Advisor applications — `/api/advisor-applications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Auth | Submit |
| GET | `/my` | Auth | Caller’s applications |
| GET | `/` | NETWORK | List |
| GET | `/:id` | NETWORK | Detail |
| PATCH | `/:id` | NETWORK | Update |
| DELETE | `/:id` | Admin+ | Delete |

---

## Services — `/api/services`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Optional | Catalog |
| GET | `/category/:category` | Public | By category |
| GET | `/:id` | Public | Detail |
| POST | `/` | SERVICE | Create |
| PATCH | `/:id` | SERVICE | Update |
| DELETE | `/:id` | SERVICE | Delete |

---

## Content (CMS) — `/api/content`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Optional | List published (+ draft for editors) |
| GET | `/types` | Public | Content types |
| GET | `/:slug` | Optional | By slug |
| POST | `/` | CONTENT | Create |
| GET | `/id/:id` | CONTENT | By id |
| PATCH | `/:id` | CONTENT | Update |
| DELETE | `/:id` | CONTENT | Delete |

---

## Audit logs — `/api/audit-logs`

Auth: AUDIT roles. Super activity with `superOnly` / `superStealth` is **hidden from non-super** callers.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | AUDIT | Paginated logs |
| GET | `/recent` | AUDIT | Recent feed |
| GET | `/summary` | AUDIT | Summary |
| DELETE | `/clear` | Admin+ | Clear old logs (retention policy) |

---

## Dashboard — `/api/dashboard`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/stats` | Auth | Role-aware overview stats |

---

## Upload — `/api/upload`

Auth required. Multipart form fields: `file` / `files` / `image` / `document`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Auth | Single file |
| POST | `/multiple` | Auth | Up to 5 files |
| POST | `/image` | Auth | Image |
| POST | `/document` | Auth | Document |
| DELETE | `/:filename` | admin | Delete file |

Staff-only vault media prefers UploadThing (`/api/uploadthing`) when configured.

---

## Search — `/api/search`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | Global search (`?q=`) |
| GET | `/quick` | Public | Quick suggestions |

---

## Funnel analytics — `/api/funnel`

Auth: FUNNEL roles.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/overview` | FUNNEL | Funnel overview |
| GET | `/sources` | FUNNEL | Lead sources |
| GET | `/consultant-performance` | FUNNEL | Consultant metrics |

---

## Notifications — `/api/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/push/vapid-public-key` | admin | VAPID public key |
| GET | `/push/status` | admin | Push subscription status |
| POST | `/push/subscribe` | admin | Register Web Push |
| DELETE | `/push/subscribe` | admin | Unsubscribe |
| GET | `/` | Auth | List notifications |
| PATCH | `/read-all` | Auth | Mark all read |
| PATCH | `/:id/read` | Auth | Mark one read |

See [ADMIN_ALERTS.md](./ADMIN_ALERTS.md).

---

## Messages — `/api/messages`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Auth | Inbox / thread list |
| POST | `/` | Auth | Send message |
| PATCH | `/read` | Auth | Mark read |

---

## Secure notes — `/api/notes`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Auth | List own notes |
| POST | `/` | Auth | Create |
| PATCH | `/:id` | Auth | Update |
| DELETE | `/:id` | Auth | Delete |

---

## Document vault — `/api/vault`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Auth | List vault docs (scoped) |
| POST | `/` | Auth | Register uploaded doc metadata |
| DELETE | `/:id` | Auth | Delete |

---

## Approvals — `/api/approvals`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/pending-count` | Admin+ | Pending count for badge |
| GET | `/` | Auth | List (scoped) |
| POST | `/` | Auth | Create request |
| PATCH | `/:id/approve` | Admin+ | Approve (anti-escalation enforced) |
| PATCH | `/:id/reject` | Admin+ | Reject |
| DELETE | `/:id` | Auth | Cancel own pending |

---

## Super Admin — `/api/super`

All routes: **protect + requireSuperAdmin** unless noted. Rate limit **60 / 60s**.

Confirm-phrase endpoints require body field `confirm` matching the phrase (and for role elevates, break-glass).

### Impersonation (also allowed for active impersonator)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/impersonate/:id` | Super | Start View-as (non-super targets only) |
| DELETE | `/impersonate` | Super or impersonator | End session |
| GET | `/impersonate/status` | Super or impersonator | Banner / status |

### Core

| Method | Path | Confirm | Description |
|--------|------|---------|-------------|
| GET | `/health` | — | Super health / deploy info |
| GET | `/pulse` | — | Live pulse metrics |
| GET | `/settings` | — | System settings |
| PATCH | `/settings` | — | Patch flags / kill switches |
| GET | `/people` | — | People directory |
| POST | `/users/:id/suspend` | `SUSPEND` | Suspend (not self) |
| POST | `/users/:id/restore` | — | Restore |
| POST | `/users/:id/force-logout` | — | Bump sessionVersion (not self) |
| POST | `/users/:id/soft-delete` | `DELETE` | Soft delete |
| POST | `/users/:id/role` | + break-glass for super | Change role (own role locked) |
| POST | `/users/:id/flags` | — | Risk flags |
| POST | `/users/:id/notes` | — | Internal note |
| POST | `/users/:id/compromised-playbook` | `COMPROMISED` | Compromised account playbook |
| GET | `/visitors/map` | — | Geo map points |
| POST | `/visitors/:visitorId/enrich-geo` | — | Refresh geo |
| GET | `/forensics/:type/:id` | — | Forensics dossier |
| GET | `/activity/stream` | — | Super activity stream |
| GET | `/activity/export` | — | Export activity |
| GET | `/watchlist` | — | List watchlist |
| POST | `/watchlist` | — | Add entry |
| DELETE | `/watchlist/:id` | — | Remove |
| GET | `/promos` | — | List promos |
| POST | `/promos` | — | Upsert promo |
| POST | `/promos/:id/kill` | — | Kill one |
| POST | `/promos/kill-all` | `KILL_PROMO` | Kill all |
| GET | `/bots` | — | Bot blocks |
| DELETE | `/bots/:id` | — | Unblock |
| POST | `/broadcast` | — | Staff broadcast |

Kill-switch types (via settings / UI): `LOCKDOWN`, `MAINTENANCE`, etc. Details in [SUPER_ADMIN.md](./SUPER_ADMIN.md).

---

## WebSockets

Socket.IO attaches to the same HTTP server.

- Authenticated dashboards receive live events (e.g. `admin:alert`).
- Video signaling is registered for consultation rooms when enabled.

Connect from the SPA using the API origin and the JWT cookie / auth handshake configured in the frontend socket client.

---

## Status codes (common)

| Code | Meaning |
|------|---------|
| 200 / 201 | Success |
| 400 | Validation / bad request |
| 401 | Missing or invalid auth |
| 403 | Authenticated but forbidden (role, CSRF, stealth) |
| 404 | Not found |
| 429 | Rate limited |
| 503 | Maintenance / lockdown for non-super |

---

## Related docs

- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [ROLES.md](./ROLES.md)
- [SECURITY.md](./SECURITY.md)
- [SUPER_ADMIN.md](./SUPER_ADMIN.md)
