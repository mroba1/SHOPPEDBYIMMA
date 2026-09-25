import type { Category, Order, OrderItem, Product } from "../types";

// Mock catalog used to seed the local JSON store on first run.
// Replace with a real database seed when you connect one.

export const img = (id: string, w = 1000) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

export const editorial = {
  hero: img("1445205170230-053b83016050", 2000),
  rackLight: img("1490481651871-ab68de25d43d", 1400),
  rackWarm: img("1512436991641-6745cdb1723f", 1400),
  redDress: img("1595777457583-95e059d581b8", 700),
  studio: img("1581338834647-b0fb40704e21", 900),
  hatPortrait: img("1611042553365-9b101441c135", 900),
};

export const seedCategories: Category[] = [
  { id: "cat_fa", slug: "fashion-accessories", name: "Fashion Accessories", codePrefix: "FA", tagline: "Bags, shades & finishing touches", image: img("1590874103328-eac38a683ce7", 900), sortOrder: 1 },
  { id: "cat_fw", slug: "footwear", name: "Footwear", codePrefix: "FW", tagline: "Heels, flats & everyday pairs", image: img("1515347619252-60a4bf4fff4f", 900), sortOrder: 2 },
  { id: "cat_ls", slug: "lingerie-sleepwear", name: "Lingerie & Sleepwear", codePrefix: "LS", tagline: "Soft satin & slow mornings", image: img("1631234764568-996fab371596", 900), sortOrder: 3 },
  { id: "cat_jw", slug: "jewelry", name: "Jewelry", codePrefix: "JW", tagline: "Pearls, gold & little sparkles", image: img("1611591437281-460bfbe1220a", 900), sortOrder: 4 },
  { id: "cat_kw", slug: "kids-wear", name: "Kids Wear", codePrefix: "KW", tagline: "Cute, comfy & playground-ready", image: img("1622290291468-a28f7a7dc6a8", 900), sortOrder: 5 },
  { id: "cat_ha", slug: "home-accessories", name: "Home Accessories", codePrefix: "HA", tagline: "Cosy finds for every room", image: img("1602874801007-bd458bb1b8b6", 900), sortOrder: 6 },
];

type SeedProduct = Omit<Product, "id" | "slug" | "createdAt" | "updatedAt" | "featured" | "available"> & {
  featured?: boolean;
  available?: boolean;
};

const raw: SeedProduct[] = [
  // Fashion accessories
  { code: "SBM-FA-001", name: "Crimson Top-Handle Bag", categorySlug: "fashion-accessories", price: 24500, compareAtPrice: 28000, description: "A structured mini bag in glossy crimson with a gold turn-lock and detachable crossbody strap. Fits your phone, cards and lipstick — nothing more, nothing less.", images: [img("1584917865442-de89df76afd3")], sizes: [], colors: ["Crimson", "Black", "Nude"], featured: true },
  { code: "SBM-FA-002", name: "Woven Tangerine Tote", categorySlug: "fashion-accessories", price: 19800, description: "Hand-woven straw body with a smooth faux-leather flap. The bag that makes every outfit look like a holiday.", images: [img("1590874103328-eac38a683ce7")], sizes: [], colors: ["Tangerine", "Natural"] },
  { code: "SBM-FA-003", name: "Round Gold-Frame Sunglasses", categorySlug: "fashion-accessories", price: 8500, description: "Lightweight round frames with a warm gold finish and UV400 tinted lenses. Comes with a soft pouch.", images: [img("1511499767150-a48a237f0083")], sizes: [], colors: ["Green lens", "Brown lens"], featured: true },
  { code: "SBM-FA-004", name: "Printed Silk-Feel Scarf", categorySlug: "fashion-accessories", price: 7200, description: "A satin-feel square scarf in a bold print. Wear it as a headwrap, a neck tie or knotted on your bag handle.", images: [img("1583846717393-dc2412c95ed7")], sizes: [], colors: ["Multi"] },

  // Footwear
  { code: "SBM-FW-001", name: "Navy Suede Pumps", categorySlug: "footwear", price: 27500, description: "Classic pointed-toe pumps in soft faux suede with a 9cm heel. Cushioned insole for long days.", images: [img("1515347619252-60a4bf4fff4f")], sizes: ["37", "38", "39", "40", "41"], colors: ["Navy", "Black"], featured: true },
  { code: "SBM-FW-002", name: "Buckle Slide Sandals", categorySlug: "footwear", price: 16800, description: "Two-strap slides with adjustable buckles and a contoured footbed. Easy, comfy, goes with everything.", images: [img("1603487742131-4160ec999306")], sizes: ["37", "38", "39", "40", "41", "42"], colors: ["Taupe", "Black"] },
  { code: "SBM-FW-003", name: "Floral Stiletto Heels", categorySlug: "footwear", price: 23000, description: "Statement stilettos in a painterly floral print. For weddings, birthdays and every 'just because'.", images: [img("1543163521-1bf539c55dd2")], sizes: ["37", "38", "39", "40"], colors: ["Blue floral"] },
  { code: "SBM-FW-004", name: "Emerald Lace-Up Brogues", categorySlug: "footwear", price: 21500, description: "Polished lace-up brogues with a low stacked heel. Smart enough for work, fun enough for the weekend.", images: [img("1560343090-f0409e92791a")], sizes: ["38", "39", "40", "41", "42", "43"], colors: ["Emerald"], available: false },

  // Lingerie & sleepwear
  { code: "SBM-LS-001", name: "Champagne Satin Slip Dress", categorySlug: "lingerie-sleepwear", price: 18500, description: "A bias-cut satin slip with adjustable straps and a soft drape. Sleepwear, loungewear — or dress it up with a blazer.", images: [img("1631234764568-996fab371596")], sizes: ["XS", "S", "M", "L", "XL"], colors: ["Champagne", "Ivory", "Black"], featured: true },
  { code: "SBM-LS-002", name: "Off-Shoulder Lounge Romper", categorySlug: "lingerie-sleepwear", price: 14800, description: "Breezy cotton-blend romper with an elasticated off-shoulder neckline. Made for lazy Sundays.", images: [img("1515372039744-b8f02a3ae446")], sizes: ["S", "M", "L", "XL"], colors: ["White"] },
  { code: "SBM-LS-003", name: "Blush Jogger Lounge Pants", categorySlug: "lingerie-sleepwear", price: 12500, description: "Brushed-soft joggers with a drawstring waist and cuffed ankles in the prettiest blush.", images: [img("1594633312681-425c7b97ccd1")], sizes: ["S", "M", "L", "XL", "2XL"], colors: ["Blush", "Grey"] },
  { code: "SBM-LS-004", name: "Oversized Sleep Shirt", categorySlug: "lingerie-sleepwear", price: 11000, description: "A roomy button-down sleep shirt in a cool cotton blend. Big sleeves, bigger comfort.", images: [img("1601762603339-fd61e28b698a")], sizes: ["S/M", "L/XL"], colors: ["Slate", "White"] },

  // Jewelry
  { code: "SBM-JW-001", name: "Classic Pearl Strand Necklace", categorySlug: "jewelry", price: 13500, description: "A single strand of lustrous faux pearls with a gold-tone clasp. Timeless on its own, gorgeous layered.", images: [img("1515562141207-7a88fb7ce338")], sizes: [], colors: ["Pearl white"], featured: true },
  { code: "SBM-JW-002", name: "Crescent Moon Pendant", categorySlug: "jewelry", price: 9800, description: "Dainty crescent charm on a fine 18k gold-plated chain with a small crystal drop.", images: [img("1599643478518-a784e5dc4c8f")], sizes: [], colors: ["Gold"] },
  { code: "SBM-JW-003", name: "Rose Gold Filigree Bracelet", categorySlug: "jewelry", price: 11200, description: "An openwork bangle with delicate filigree detailing in a warm rose gold finish.", images: [img("1611591437281-460bfbe1220a")], sizes: [], colors: ["Rose gold", "Gold"] },
  { code: "SBM-JW-004", name: "Chunky Gold Chain Bracelet", categorySlug: "jewelry", price: 8900, description: "Bold curb-link chain bracelet with a toggle clasp. Tarnish-resistant plating.", images: [img("1602173574767-37ac01994b2a")], sizes: [], colors: ["Gold"] },
  { code: "SBM-JW-005", name: "Vintage Halo Ring", categorySlug: "jewelry", price: 10500, description: "A vintage-inspired cocktail ring with a sparkling halo setting.", images: [img("1605100804763-247f67b3557e")], sizes: ["6", "7", "8"], colors: ["Silver"] },

  // Kids wear
  { code: "SBM-KW-001", name: "Bear Hooded Onesie", categorySlug: "kids-wear", price: 12000, description: "The snuggliest fleece onesie with little bear ears on the hood and a full-length zip for easy changes.", images: [img("1522771930-78848d9293e8")], sizes: ["6–12 months", "1–2 years", "2–3 years", "4–5 years"], colors: ["Mocha", "Cream"], featured: true },
  { code: "SBM-KW-002", name: "Little Gent Blazer Set", categorySlug: "kids-wear", price: 22000, description: "Navy cardigan-blazer, crisp shirt, bow tie and shorts. Party-ready in one easy order.", images: [img("1519238263530-99bdd11df2ea")], sizes: ["2–3 years", "4–5 years", "6–7 years"], colors: ["Navy / Blue"] },
  { code: "SBM-KW-003", name: "Yellow Rain Jacket", categorySlug: "kids-wear", price: 15500, description: "Waterproof hooded rain jacket in sunshine yellow. Lightweight and packable.", images: [img("1503919545889-aef636e10ad4")], sizes: ["2–3 years", "4–5 years", "6–7 years", "8–9 years"], colors: ["Yellow"] },
  { code: "SBM-KW-004", name: "Everyday Tee & Beanie Set", categorySlug: "kids-wear", price: 9500, description: "Soft cotton tee with a matching pom-pom beanie. A little basics bundle for busy mornings.", images: [img("1622290291468-a28f7a7dc6a8")], sizes: ["1–2 years", "2–3 years", "4–5 years"], colors: ["White"] },

  // Home accessories
  { code: "SBM-HA-001", name: "Amber Glow Scented Candle", categorySlug: "home-accessories", price: 6800, description: "Hand-poured soy wax candle in an amber glass jar. Notes of vanilla, cedar and warm musk. 40-hour burn.", images: [img("1602874801007-bd458bb1b8b6")], sizes: [], colors: ["Amber"], featured: true },
  { code: "SBM-HA-002", name: "Cloud Throw Pillow", categorySlug: "home-accessories", price: 9200, description: "Plush pillow insert with a removable, washable cover. Instantly makes your sofa look styled.", images: [img("1584100936595-c0654b55a2e2")], sizes: ["45×45cm", "50×50cm"], colors: ["White", "Blush", "Beige"] },
  { code: "SBM-HA-003", name: "Chunky Knit Throw", categorySlug: "home-accessories", price: 18500, description: "A heavy chunky-knit throw for movie nights, cold AC and everything in between.", images: [img("1578500494198-246f612d3b3d")], sizes: ["130×170cm"], colors: ["Grey", "Oat"] },
  { code: "SBM-HA-004", name: "Minimal Pendant Lamp", categorySlug: "home-accessories", price: 21000, description: "A clean dome pendant shade in matte finish. Bulb not included.", images: [img("1513506003901-1e6a229e2d15")], sizes: [], colors: ["White", "Black"] },
];

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function buildSeedProducts(): Product[] {
  const now = Date.now();
  return raw.map((p, i) => ({
    ...p,
    id: `prd_${p.code.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    slug: `${slugify(p.name)}-${p.code.slice(-6).toLowerCase()}`,
    featured: p.featured ?? false,
    available: p.available ?? true,
    createdAt: new Date(now - i * 36e5 * 5).toISOString(),
    updatedAt: new Date(now - i * 36e5 * 5).toISOString(),
  }));
}

function line(products: Product[], code: string, quantity: number, size?: string, color?: string): OrderItem {
  const p = products.find((x) => x.code === code)!;
  return {
    productId: p.id,
    productCode: p.code,
    slug: p.slug,
    name: p.name,
    image: p.images[0],
    unitPrice: p.price,
    size,
    color,
    quantity,
  };
}

export function buildSeedOrders(products: Product[]): Order[] {
  const hoursAgo = (h: number) => new Date(Date.now() - h * 36e5).toISOString();
  const make = (
    code: string,
    customer: Order["customer"],
    items: OrderItem[],
    status: Order["status"],
    paymentStatus: Order["paymentStatus"],
    h: number,
    history: string[] = [],
  ): Order => ({
    id: `ord_${code.toLowerCase().replace("-", "")}`,
    code,
    customer,
    items,
    total: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    status,
    paymentStatus,
    createdAt: hoursAgo(h),
    updatedAt: hoursAgo(Math.max(h - 2, 0)),
    history: [
      { at: hoursAgo(h), label: "Order created on website" },
      ...history.map((label, i) => ({ at: hoursAgo(h - (i + 1) * 3), label })),
    ],
  });

  return [
    make("SBM-7K42P", { name: "Jane Doe", whatsapp: "08031234567", address: "14 Admiralty Way, Lekki Phase 1, Lagos", note: "Please call before delivery." },
      [line(products, "SBM-LS-001", 1, "M", "Champagne"), line(products, "SBM-KW-001", 2, "4–5 years", "Mocha")], "PENDING", "PENDING", 1),
    make("SBM-Q8M3T", { name: "Chiamaka Obi", whatsapp: "08109876543", address: "22 Ogui Road, Enugu" },
      [line(products, "SBM-FA-001", 1, undefined, "Crimson"), line(products, "SBM-JW-001", 1, undefined, "Pearl white")], "AWAITING_PAYMENT", "PENDING", 6, ["Status changed to Confirmed", "Status changed to Awaiting payment"]),
    make("SBM-4F91X", { name: "John Adeyemi", whatsapp: "08024446688", address: "21 Herbert Macaulay Way, Yaba, Lagos" },
      [line(products, "SBM-JW-002", 2, undefined, "Gold")], "CONFIRMED", "PENDING", 3, ["Status changed to Confirmed"]),
    make("SBM-H2W9R", { name: "Tolu Adebayo", whatsapp: "07065554321", address: "5 Bodija Estate, Ibadan, Oyo" },
      [line(products, "SBM-FW-001", 1, "39", "Navy")], "PAYMENT_CONFIRMED", "CONFIRMED", 20, ["Status changed to Confirmed", "Payment marked as confirmed"]),
    make("SBM-5NXC4", { name: "Amaka Eze", whatsapp: "09023344556", address: "Plot 8, Wuse 2, Abuja" },
      [line(products, "SBM-HA-001", 3, undefined, "Amber"), line(products, "SBM-HA-002", 2, "45×45cm", "Blush")], "PROCESSING", "CONFIRMED", 44, ["Status changed to Confirmed", "Payment marked as confirmed", "Status changed to Processing"]),
    make("SBM-D7P2K", { name: "Funmi Bello", whatsapp: "08187766554", address: "3 Allen Avenue, Ikeja, Lagos" },
      [line(products, "SBM-JW-002", 1, undefined, "Gold"), line(products, "SBM-FA-003", 1, undefined, "Brown lens")], "SHIPPED", "CONFIRMED", 72, ["Status changed to Confirmed", "Payment marked as confirmed", "Status changed to Shipped"]),
    make("SBM-B4Y6V", { name: "Ngozi Okafor", whatsapp: "08035550199", address: "11 Trans-Amadi Road, Port Harcourt" },
      [line(products, "SBM-KW-003", 1, "6–7 years", "Yellow"), line(products, "SBM-KW-004", 1, "2–3 years", "White")], "DELIVERED", "CONFIRMED", 160, ["Status changed to Confirmed", "Payment marked as confirmed", "Status changed to Shipped", "Status changed to Delivered"]),
    make("SBM-R9T3E", { name: "Blessing Umeh", whatsapp: "07012223344", address: "7 Aba Road, Umuahia" },
      [line(products, "SBM-LS-003", 1, "L", "Grey")], "CANCELLED", "PENDING", 210, ["Status changed to Cancelled"]),
  ];
}
