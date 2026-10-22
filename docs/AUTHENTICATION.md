# Authentication & sessions

## Login flow

1. `POST /api/users/login` with email + password.
2. Server issues JWT (HS512) with claims including `id`, `role`, `sessionVersion`, issuer/audience.
3. Token set as httpOnly cookie `jwt` and often also returned in the JSON body for Bearer use.
4. SPA stores user profile in client state; subsequent API calls send cookie + `X-Requested-With`.

## Registration

- Public self-register: `POST /api/users/register` (rate-limited).
- Can be disabled via Super feature flag `registration` (non-admins blocked).
- Admins creating staff accounts call the same endpoint while authenticated (`optionalAuth`).

## Password reset

1. `POST /api/users/forgot-password` → email with token.
2. `POST /api/users/reset-password/:token` → new password.
3. Compromised playbook clears outstanding reset tokens.

## Session invalidation

- **Logout** clears cookie.
- **Force logout / compromised / lockdown** bumps `sessionVersion` on the user document; old JWTs fail `protect` even if unexpired.
- Impersonation uses a short-lived JWT (≈30 minutes) carrying impersonator + acting-as ids.

## CSRF

Cookie-authenticated mutating requests must include:

```
X-Requested-With: XMLHttpRequest
```

Bearer-only clients that do not rely on cookies are treated per `csrfGuard` rules (SPA always sends the header).

## Impersonation (“View as”)

| Rule | Behavior |
|------|----------|
| Who | `super_admin` only |
| Target | Any non-`super_admin` user |
| UI | Persistent banner; exit restores super session |
| API | Cannot call other `/api/super/*` controls while acting as target |
| Audit | Rows include `impersonatorId` + `actingAsId` |

Endpoints: see Super section in [API.md](./API.md).

## Role checks

Middleware:

- `protect` — require valid JWT + active user + matching `sessionVersion`
- `authorize(...roles)` — role allowlist
- `requireSuperAdmin` — `super_admin` only
- `requireSuperOrImpersonator` — exit/status during View as
- `requireConfirmPhrase(phrase)` — body `confirm` must match

## Related

- [ROLES.md](./ROLES.md)
- [SECURITY.md](./SECURITY.md)
- [SUPER_ADMIN.md](./SUPER_ADMIN.md)
