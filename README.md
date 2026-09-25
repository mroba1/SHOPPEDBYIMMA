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
            Render (backend/server.ts) ──► persistent disk: db.json + uploads/
```

### 1. Render (do this first)

1. Render dashboard → **New → Blueprint** → select this repo. `render.yaml` creates the
   `shoppedbyimma-api` service with a 1 GB disk (Starter plan; the free plan has no disks).
2. When asked, enter **ADMIN_EMAIL** and **ADMIN_PASSWORD** for the seller's login.
3. Once it's live, copy `API_SECRET` and `ADMIN_RECOVERY_KEY` from **Environment**. Keep the recovery key somewhere safe.
4. Check that `https://<your-service>.onrender.com/health` returns `{"ok":true,…}`.

### 2. Vercel

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
