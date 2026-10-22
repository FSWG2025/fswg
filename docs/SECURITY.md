# Security

## Controls in place

| Area | Behavior |
|------|----------|
| JWT | HS512, issuer/audience checks, `sessionVersion` revocation |
| CSRF | Cookie mutations require `X-Requested-With` |
| CORS | Exact `CLIENT_URL` origin(s), credentials |
| Rate limits | Auth, password reset, public lead create, super routes |
| Bot guard | UA / headless / velocity scoring; blocks in `BotBlock` |
| Maintenance / lockdown | Fail closed for non-super; allowlisted health/login/track |
| IDOR | Lead and similar resources scoped to role / ownership |
| Approvals | Anti-escalation — cannot approve grants that raise privilege beyond policy |
| Uploads | SVG / type checks; staff vault via UploadThing + JWT |
| Impersonation | Bound to super; short TTL; audited; no nested super targets |
| Super stealth | `superOnly` / `superStealth` audit rows hidden from normal admins |
| Open redirects | Reset / deep-link targets sanitized |
| Self-harm | Super cannot suspend / force-logout / compromise / soft-delete self; own role locked |

## Audit trail

- Mutating `/api` success paths are logged (controllers may log richer details).
- Activity UI shows **exact action**, **location** (approx geo when available), and human dates (e.g. `22nd of October 2026 at …`).
- Super stream/export: `/api/super/activity/*`.
- Admin feed: `/api/audit-logs/*` without stealth rows.

## Threat playbooks

Documented in [SUPER_ADMIN.md](./SUPER_ADMIN.md):

- Compromised account (`COMPROMISED`)
- Lockdown
- Maintenance
- Bot flood / watchlist

## Secrets hygiene

- Rotate `JWT_SECRET` only with a planned logout of all sessions.
- Rotate `SUPER_ADMIN_BREAK_GLASS` after use.
- Never put Atlas passwords or UploadThing tokens in git or docs.
- Prefer Render/Vercel secret stores over `.env` files in CI.

## Reporting

Treat production security incidents through Super Security + audit export, then rotate break-glass and review watchlist / bot blocks.

## Related

- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [API.md](./API.md)
- [SUPER_ADMIN.md](./SUPER_ADMIN.md)
