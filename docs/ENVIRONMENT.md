# Environment variables

Never commit real secrets. Use `backend/.env` and `frontend/.env` locally (both gitignored). Templates: `backend/.env.example`, `frontend/.env.example`.

## Backend

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | No (default 5000) | HTTP listen port |
| `NODE_ENV` | Yes in prod | `development` \| `production` |
| `STAGE` | No | Extra stage flag (e.g. development CORS helpers) |
| `MONGO_URL` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | HS512 signing secret — long random string |
| `CLIENT_URL` | Yes | SPA origin for CORS, emails, sitemap (comma-separated if multiple) |
| `EMAIL_FROM` | No | From address for transactional mail |
| `UPLOADTHING_TOKEN` | For vault | UploadThing; vault uploads disabled if unset |
| `SUPER_ADMIN_EMAIL` | No | Hint for manual promote (docs / ops) |
| `SUPER_ADMIN_BREAK_GLASS` | For elevating supers | Required to assign/demote `super_admin` |
| `GEOIP_PROVIDER` | No | Default `ipapi` |
| `GEOIP_TOKEN` / `IPAPI_KEY` | No | Better visitor map accuracy |
| `DEPLOY_SHA` / `GIT_SHA` | No | Shown on super health |
| `VAPID_PUBLIC_KEY` | For Web Push | Admin desktop alerts |
| `VAPID_PRIVATE_KEY` | For Web Push | Server only |
| `VAPID_SUBJECT` | No | `mailto:` or site URL |

Generate VAPID keys:

```bash
cd backend
npx web-push generate-vapid-keys
```

## Frontend

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_BASE_URL` | Yes | API base including `/api`, e.g. `https://api.example.com/api` |
| `VITE_VAPID_PUBLIC_KEY` | No | Optional mirror; normally fetched from API |

Local example:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Production (Vercel):

```env
VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api
```

Vite embeds `VITE_*` at **build time** — change requires a redeploy.

## Wiring checklist

1. Atlas cluster created → put `MONGO_URL` on Render.
2. Render API live → set `CLIENT_URL` to the Vercel URL(s).
3. Vercel build → set `VITE_API_BASE_URL` to Render `/api`.
4. Promote first super admin (see [SUPER_ADMIN.md](./SUPER_ADMIN.md)).
5. Rotate `SUPER_ADMIN_BREAK_GLASS` after incident use.

## Related

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ADMIN_ALERTS.md](./ADMIN_ALERTS.md)
- [SUPER_ADMIN.md](./SUPER_ADMIN.md)
