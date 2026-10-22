# Super Admin Command Center

God-mode operations surface for First Step Wealth Group. Route: `/dashboard/super`. APIs: `/api/super/*`.

See also: [docs index](./README.md) · [API — Super](./API.md#super-admin--apisuper) · [Security](./SECURITY.md) · [Roles](./ROLES.md)

**No seed or demo data is shipped.** Bootstrap a real account only.

## Bootstrap the first super admin

1. Create a normal user account (register or existing admin).
2. In MongoDB, promote that user **once**:

```js
db.users.updateOne(
  { email: "you@firststepwealthgroup.ca" },
  { $set: { role: "super_admin", isActive: true } }
)
```

Or set `SUPER_ADMIN_EMAIL` in the backend environment and run a one-off promote from a trusted shell (not a public endpoint):

```bash
# Example one-liner against your running Mongo URI (adjust as needed)
mongosh "$MONGODB_URI" --eval 'db.users.updateOne({email: process.env.SUPER_ADMIN_EMAIL}, {$set:{role:"super_admin"}})'
```

3. Sign out and sign back in so the JWT reflects `super_admin`.
4. Open `/dashboard/super`.

## Promoting additional super admins

Only an existing `super_admin` can assign the role via People → role change, and must provide:

- Confirm phrase: `SUPER_ADMIN`
- Break-glass code from env: `SUPER_ADMIN_BREAK_GLASS`

Never commit the break-glass value. Rotate after use in incidents.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `SUPER_ADMIN_BREAK_GLASS` | Required to create/demote `super_admin` |
| `SUPER_ADMIN_EMAIL` | Optional document-only hint for who to promote manually |
| `GEOIP_PROVIDER` | `ipapi` (default) |
| `GEOIP_TOKEN` / `IPAPI_KEY` | Optional; improves visitor map lat/lng |
| `DEPLOY_SHA` / `GIT_SHA` | Shown on security/health |
| `JWT_SECRET` | Existing — tokens now also carry `sessionVersion` |

## Threat playbooks

### Compromised client/staff account

People → **Compromised** (type `COMPROMISED`):

- Suspends account
- Bumps `sessionVersion` (force logout everywhere)
- Clears password-reset tokens
- Sets `legal_hold` + `high_risk`

### Lockdown

Kill Switches → Lockdown (type `LOCKDOWN`):

- Revokes sessions for everyone except `super_admin`
- Blocks non-super API use except login/health

### Maintenance

Kill Switches → Maintenance (type `MAINTENANCE`):

- Public banner via `/api/system/public`
- Non-super APIs return `503` with allowlist for health, login, visitor track, super routes

### Bot flood

Bot guard is on by default (`botBlockEnabled`).

- UA / headless / path-velocity scoring on public endpoints
- Blocks stored in `BotBlock`; manage under Security
- Watchlist alerts when a watched IP/email/visitor returns (audit: `Watchlist hit`)

## Impersonation

- Super only; cannot impersonate another super
- 30-minute JWT; banner always visible
- Actions audited with `impersonatorId` + `actingAsId`
- Exit restores the super session; cannot hit other `/api/super/*` controls while impersonating

## Feature flags

DB-backed on `SystemSettings.featureFlags`. Toggles that affect real surfaces:

- `registration` — blocks `/api/users/register` for non-admins
- `leadCapture` — blocks public lead create
- Others (video, wealth studio, etc.) are available for progressive wiring

## Retention / audit

- Audit logs are **not** deletable from Super UI
- Soft-delete is refused when `legal_hold` is set
- Visitor geo is approximate; UI labels “approx.”
