# SHOPPEDBYIMMA — *your shein errand girl*

A storefront and private seller dashboard built with Next.js 16, React 19 and Tailwind CSS 4.
There is no online payment. Customers build a cart, get an order code (e.g. `SBM-7K42P`)
and send it to the seller on WhatsApp. The seller pastes the code into her dashboard and sees
exactly which products were ordered, with photos.

## Run it

```bash
npm install
npm run dev                  # http://localhost:3000
```

- Store: `/`
- Seller studio: `/manage-shoppedbyimma` (in dev: `admin@shoppedbyimma.com` / `imma-admin`)
- Optional customer accounts: `/account`

The first request creates `data/db.json` with demo categories, 25 products and 8 sample orders.
To reset, stop the server, delete `data/`, and start it again.

## Flows

**Customer:** Home → Shop → Product (size & colour) → Cart → Checkout (name, WhatsApp, address, note) →
order code → **Continue to WhatsApp** (message pre-filled). No account needed. Customers can
optionally create one to see their orders and statuses and get checkout pre-filled.

**Seller:** private URL → sign in → Dashboard → paste the code (or the whole WhatsApp message) →
**Find order** → photos, product codes, sizes, colours, quantities, prices → Confirm →
Awaiting payment → Payment confirmed → Processing → Shipped → Delivered.

## Admin security

| Layer | What it does |
| --- | --- |
| Private URL | Login lives at `/<ADMIN_PATH>` only. `/admin/*` returns **404** to strangers, and `/admin/login` can't be opened directly. Browsers that have signed in before are sent to the login page. |
| Passwords | Hashed with scrypt, stored on the server that owns the data. Never in frontend code. |
| Sessions | httpOnly, signed (HMAC-SHA256) cookies that expire after 12 h. Changing the password or "Log out of all devices" invalidates every old session. |
| Checks | `proxy.ts` (fast signature check) → every admin layout/page → every server action, including a database check of the account. |
| Brute force | 5 wrong passwords lock that login for 15 minutes. |
| Forgot password | Needs `ADMIN_RECOVERY_KEY` (a server-only secret). There's no email service yet. |
| No registration | Admin accounts can't be created from the website. The first one comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. |

Order codes are random (`SBM-` plus 5 characters from a 32-letter alphabet with no O/0/I/1),
unique in the database, and never sequential.
Each order stores a **snapshot** of every item (name, code, image, price, size, colour, quantity),
so editing or deleting a product never changes past orders.

## Where things live

| Path | What |
| --- | --- |
| `lib/config.ts` | Business name, WhatsApp number, socials |
| `app/globals.css` | Brand palette from the flyer. Tailwind's default colours are disabled |
| `lib/types.ts` | Category, Product, Order, AdminUser, CustomerAccount, StoreSettings |
| `lib/data/repo.ts` | The data API the app imports: local file in dev, Render backend when `API_URL` is set |
| `lib/data/local-repo.ts` | Products, orders, status rules, order codes |
| `lib/data/local-accounts.ts` | Admin + customer accounts, login protection, settings |
| `lib/data/store.ts` | JSON-file storage (`DATA_DIR`, default `./data`) |
| `lib/auth.ts`, `lib/session.ts`, `proxy.ts` | Sessions and route protection |
| `backend/server.ts` | Render backend: exposes the data layer over HTTP |
| `app/admin/` | Seller studio: dashboard, orders, products, categories, customers, settings |
| `app/(store)/account/` | Optional customer accounts |

## Deploying: Render (backend) + Vercel (frontend)

```
Browser ──► Vercel (Next.js: shop, checkout, admin UI, sessions)
                │  server-side only, Bearer API_SECRET
                ▼
            Render free (backend/server.ts) ──► Neon free Postgres (orders, products, photos)
```

Render's free plan has no permanent disk, so the backend keeps everything in a Neon
Postgres database (`DATABASE_URL`). It creates its own table on first start.

### 1. Neon (database)

1. Sign up at **neon.tech** → create a project (region: **AWS Europe (Frankfurt)**).
2. On the project dashboard, click **Connect** and copy the **connection string**
   (starts with `postgresql://…`).

### 2. Render (backend)

1. Render dashboard → **New → Blueprint** → select this repo. `render.yaml` creates the
   free `shoppedbyimma-api` service.
2. When asked, fill in `DATABASE_URL` (from Neon), `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_RECOVERY_KEY`.
3. Once it's live, copy `API_SECRET` from **Environment**.
4. Check that `https://<your-service>.onrender.com/health` returns `{"ok":true,…,"storage":"database"}`.
5. Optional: Render's free plan sleeps after 15 minutes idle, and the first visit then takes ~50s.
   A free uptime checker (cron-job.org or UptimeRobot) hitting `/health` every 10 minutes keeps it awake.

### 3. Vercel (website)

| Name | Value |
| --- | --- |
| `API_URL` | `https://<your-service>.onrender.com` |
| `API_SECRET` | the value copied from Render |
| `SESSION_SECRET` | 32+ random characters (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `ADMIN_PATH` | your private login path, e.g. `manage-shoppedbyimma-7q2x` |

### Preview on Vercel without Render

Leave `API_URL` empty and set `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (and optionally
`ADMIN_PATH`) on Vercel. Everything works, but data lives in Vercel's temp storage and resets
whenever Vercel starts a fresh instance. Use it for looking around, not for real orders.
