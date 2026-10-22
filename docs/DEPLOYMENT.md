# Deployment (GitHub → Render + Vercel)

Monorepo: API on **Render**, SPA on **Vercel**, database on **MongoDB Atlas**.

## Order of operations

1. **MongoDB Atlas** — cluster + DB user + network access (or `0.0.0.0/0` for Render).
2. **Push monorepo to GitHub**.
3. **Render** — Web Service from `backend/`.
4. **Vercel** — Project from `frontend/` (Root Directory = `frontend`).
5. Set **cross env**: Render `CLIENT_URL` → Vercel URL; Vercel `VITE_API_BASE_URL` → Render `/api`.
6. Bootstrap **super_admin** in Atlas (see [SUPER_ADMIN.md](./SUPER_ADMIN.md)).

## GitHub

```bash
cd /path/to/fswg
git status
# ensure .env files are ignored (git check-ignore -v backend/.env)
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<org>/<repo>.git
git push -u origin main
```

Do not commit `.env`, credentials, or break-glass secrets.

## MongoDB Atlas

1. Create cluster.
2. Database Access → user with read/write.
3. Network Access → allow Render egress (or temporary `0.0.0.0/0`).
4. Connect → copy URI into `MONGO_URL`.

## Render (backend)

| Setting | Value |
|---------|--------|
| Root / build | `backend` — `npm install` + `npm run build` (match `package.json`) |
| Start | `npm start` or compiled entry |
| Env | See [ENVIRONMENT.md](./ENVIRONMENT.md) |

Minimum env on Render:

- `NODE_ENV=production`
- `MONGO_URL`
- `JWT_SECRET` (strong random)
- `CLIENT_URL=https://<vercel-app>.vercel.app` (add custom domain later)
- Optional: UploadThing, VAPID, GeoIP, `SUPER_ADMIN_BREAK_GLASS`, `DEPLOY_SHA`

Confirm `GET https://<render>/api/health` returns OK.

## Vercel (frontend)

| Setting | Value |
|---------|--------|
| Root Directory | `frontend` |
| Framework | Vite (`frontend/vercel.json` already rewrites SPA routes) |
| Env | `VITE_API_BASE_URL=https://<render>.onrender.com/api` |

Redeploy after changing any `VITE_*` variable.

## CORS / cookies

- `CLIENT_URL` must list exact SPA origin(s).
- Production cookies use Secure + SameSite appropriate for cross-site API; keep API and SPA on HTTPS.
- If login works locally but not in prod, check cookie domain, `CLIENT_URL`, and CSRF header.

## Custom domains

1. Point apex/www to Vercel.
2. Point `api.` (optional) to Render.
3. Update `CLIENT_URL` and `VITE_API_BASE_URL` accordingly; redeploy both.

## Post-deploy smoke test

- [ ] `/api/health`
- [ ] SPA loads; login sets session
- [ ] Lead capture / visitor track
- [ ] Admin dashboard + notifications
- [ ] Super `/dashboard/super` after promote
- [ ] UploadThing vault (if token set)

## Related

- [ENVIRONMENT.md](./ENVIRONMENT.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [SECURITY.md](./SECURITY.md)
