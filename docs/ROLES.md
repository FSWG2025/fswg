# Roles & permission groups

Source of truth: `backend/src/constants/roles.ts`.

## User roles

| Role | Purpose |
|------|---------|
| `super_admin` | Command Center; inherits all admin powers; stealth from normal admins |
| `admin` | Platform admin (CRM, approvals, users, content, alerts) |
| `consultant` | Client / lead work |
| `ops_manager` | Ops + funnel + user manage |
| `rental_specialist` | Rental pipeline |
| `underwriter` | Rental approve/delete paths |
| `network_manager` | Advisor network |
| `mentor` | Advisor network support |
| `support_agent` | Support + limited user directory |
| `content_editor` | CMS |
| `client` / other end-user roles | Dashboard-scoped self-service |

Exact end-user role strings may include additional product roles; check `UserRole` in the roles constant file.

## Permission groups (API)

| Group | Typical members | Used for |
|-------|-----------------|----------|
| `SUPER_ADMIN_ROLES` | `super_admin` | `/api/super/*` |
| `ADMIN_ROLES` | `admin`, `super_admin` | Admin-only mutations, visitors, push |
| `CRM_ROLES` | admin+, consultant, ops, rental_specialist | Consultation stats, CRM |
| `LEAD_ROLES` | CRM-like | Lead CRUD / convert |
| `LEAD_BULK_ROLES` | admin+, ops_manager | Bulk assign |
| `RENTAL_STAFF_ROLES` | staff + underwriter | Status / request-info |
| `RENTAL_DELETE_ROLES` | admin+, underwriter | Delete applications |
| `NETWORK_ROLES` | network + mentor + admin+ | Advisor applications |
| `USER_MANAGE_ROLES` | admin+, consultant, ops, support | User directory |
| `USER_ADMIN_ROLES` | admin+, | Hard delete / export users |
| `CONTENT_ROLES` | admin+, content_editor | CMS write |
| `SERVICE_ROLES` | admin+, ops_manager | Services catalog write |
| `AUDIT_ROLES` | admin+, ops_manager | Audit log read |
| `FUNNEL_ROLES` | (see constants) | Funnel analytics |
| `APPROVAL_QUEUE_ROLES` | broad staff | Submit / see queue |

`super_admin` is included in nearly every staff allowlist so god-mode never loses access to admin APIs.

## Super-only constraints

- Cannot suspend / force-logout / run compromised playbook / soft-delete **yourself**.
- Own role in the People directory is locked as `super_admin` (no self demotion via UI).
- Last remaining `super_admin` cannot be demoted away.
- Promoting to `super_admin` requires confirm phrase `SUPER_ADMIN` + `SUPER_ADMIN_BREAK_GLASS`.

## Frontend gates

- Admin shell: `admin` / staff roles → `/dashboard/admin` (and related).
- Super shell: `super_admin` → `/dashboard/super` (+ Admin overview linked in Super sidebar).
- Impersonation: UI follows the **acting-as** user’s dashboard until exit.

## Related

- [API.md](./API.md)
- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [SUPER_ADMIN.md](./SUPER_ADMIN.md)
