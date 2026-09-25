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
| `lib/data/repo.ts` | **All data access.** Swap for Prisma/Supabase here |
| `lib/data/store.ts` | JSON-file storage used by the MVP |
| `lib/data/seed.ts` | Demo catalogue |
| `lib/actions/` | Server actions (place order, update status, products, upload, login) |
| `components/` | Header, Footer, ProductCard/Grid, CategoryCard, CartDrawer, CartItem, CheckoutForm, OrderSummary, WhatsAppCheckoutButton, AdminSidebar, AdminOrderTable, AdminProductTable, OrderDetails, StatusBadge… |

## Before going live

- The JSON file and `data/uploads/` need a persistent disk (a VPS, Railway or Render with a volume).
  On serverless hosts like Vercel, move `repo.ts` to a real database and store uploads in S3, Cloudinary or Supabase Storage.
- Set a strong `ADMIN_PASSWORD` and a random `ADMIN_SECRET`.
- Order totals are always recalculated on the server from product prices. Prices sent by the browser are never trusted.
