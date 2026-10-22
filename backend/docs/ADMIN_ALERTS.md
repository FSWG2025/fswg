# Admin real-time alerts

Critical events (approval queue, rental/advisor submissions) notify **admins only** via:

1. **In-app** `Notification` records (bell / Alerts panel)
2. **Socket.IO** `admin:alert` (live badge + optional sound while logged in)
3. **Web Push** (OS notification when the dashboard tab is closed)

Phase 1 = sound + live socket. Phase 2 = Web Push.

## Env vars

| Variable | Purpose |
|----------|---------|
| `VAPID_PUBLIC_KEY` | Web Push public key (also exposed to admin clients) |
| `VAPID_PRIVATE_KEY` | Web Push private key (server only) |
| `VAPID_SUBJECT` | Contact URI, e.g. `mailto:hello@firststepwealth.ca` or your `CLIENT_URL` |

Generate keys:

```bash
cd backend
npx web-push generate-vapid-keys
```

Add the printed keys to `backend/.env`, then restart the API.

Frontend (optional, must match public key if you hardcode; normally fetched from API):

```env
VITE_VAPID_PUBLIC_KEY=<same as VAPID_PUBLIC_KEY>
```

## How to test

1. Log in as an **admin**. Open Account & preferences → enable **Play sound for alerts**, click the bell once (unlocks audio), then **Enable desktop alerts** and allow the browser permission.
2. Keep the admin tab open → ask another user/staff to create an approval request or submit a rental/advisor application → badge updates immediately and a short chime plays (if sound is on).
3. Close the admin tab (leave the browser running) → trigger another critical event → OS/desktop notification should appear. Click it to open the deep link (e.g. `/admin/approvals`).

**Notes:** Web Push needs HTTPS in production (localhost is OK for Chrome). Safari support is best-effort. If permission was denied, re-enable notifications for the site in browser settings.
