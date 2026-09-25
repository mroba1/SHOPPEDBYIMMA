# SHOPPEDBYIMMA — *your shein errand girl*

A storefront and seller dashboard built with Next.js 16, React 19 and Tailwind CSS 4.
There is no online payment. Customers build a cart, get an order code (e.g. `SBM-7K42P`),
and send it to the seller on WhatsApp. The seller looks up the code in the admin to see
exactly which products (with images) were ordered.

## Run it

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD and ADMIN_SECRET
npm run dev                  # http://localhost:3000
```

- Store: `/`
- Seller studio: `/admin` (default password `imma-admin` if `.env.local` is not set)

The first request creates `data/db.json` with demo categories, 25 products and 7 sample orders.
Delete the `data/` folder to reset.

## Flows

**Customer:** Home → Shop / Category → Product (size & colour) → Add to cart → Cart →
Checkout (name, WhatsApp, address, note) → Order code page → **Continue to WhatsApp** (message pre-filled).

**Seller:** Dashboard → paste the code (or just `7K42P`) → order with product photos, codes,
sizes, colours, quantities → *Items available — confirm* → *Mark payment confirmed* →
Processing → Shipped → Delivered. Pre-written WhatsApp replies to the customer are on every order.

## Where things live

| Path | What |
| --- | --- |
| `lib/config.ts` | Business name, WhatsApp number, socials |
| `app/globals.css` | Brand palette from the flyer. Tailwind's default colours are disabled |
| `lib/types.ts` | Category, Product, Order and CartLine types |
| `lib/data/repo.ts` | The data API the app imports: local file in dev, Render backend when `API_URL` is set |
| `lib/data/local-repo.ts` | The actual data logic (orders, products, pricing). Swap for Prisma/Postgres here |
| `lib/data/store.ts` | JSON-file storage (`DATA_DIR`, default `./data`) |
| `backend/server.ts` | Render backend: exposes `local-repo` over HTTP |
| `lib/data/seed.ts` | Demo catalogue |
| `lib/actions/` | Server actions (place order, update status, products, upload, login) |
| `components/` | Header, Footer, ProductCard/Grid, CategoryCard, CartDrawer, CartItem, CheckoutForm, OrderSummary, WhatsAppCheckoutButton, AdminSidebar, AdminOrderTable, AdminProductTable, OrderDetails, StatusBadge… |

## Deploying: Render (backend) + Vercel (frontend)

```
Browser ──► Vercel (Next.js: pages, cart, checkout, admin login)
                │  server-side only, Bearer API_SECRET
                ▼
            Render (backend/server.ts) ──► persistent disk: db.json + uploads/
```

The browser never calls Render directly, and the API secret stays on the servers.
Locally, leave `API_URL` empty and everything runs from `data/db.json` with no backend.

### 1. Render (do this first)

1. Render dashboard → **New → Blueprint** → select this repo. `render.yaml` creates the
   `shoppedbyimma-api` service with a 1 GB disk at `/var/data`. This needs the Starter plan; the free plan has no disks.
2. Once it's live, open the service → **Environment** → copy the generated `API_SECRET`.
3. Check that `https://<your-service>.onrender.com/health` returns `{"ok":true,…}`.

### 2. Vercel

1. **Add New → Project** → import this repo (Next.js is detected automatically).
2. Add these environment variables:

| Name | Value |
| --- | --- |
| `API_URL` | `https://<your-service>.onrender.com` |
| `API_SECRET` | the value copied from Render |
| `ADMIN_PASSWORD` | the seller's login password |
| `ADMIN_SECRET` | any long random string (signs the login cookie) |

3. Deploy. `vercel.json` runs the functions in Frankfurt (`fra1`), next to the Render service.

### Notes

- Order totals are always recalculated on the backend from product prices. Prices sent by the browser are never trusted.
- Render takes daily disk snapshots. When the shop grows, move `lib/data/local-repo.ts` to Postgres; nothing else has to change.
