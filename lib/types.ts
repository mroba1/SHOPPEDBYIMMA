// Domain types shared by the storefront, the admin dashboard and the data layer.
// These map 1:1 to the tables/collections you would create in a real database.

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PAYMENT_CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "CONFIRMED";

export interface Category {
  id: string;
  slug: string;
  name: string;
  /** Two-letter code used to build product codes, e.g. "FA" → SBM-FA-001 */
  codePrefix: string;
  tagline: string;
  image: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  /** Unique, human-friendly product code, e.g. SBM-FA-001 */
  code: string;
  slug: string;
  name: string;
  categorySlug: string;
  /** Price in Naira (whole numbers) */
  price: number;
  compareAtPrice?: number;
  description: string;
  images: string[];
  sizes: string[];
  colors: string[];
  available: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A snapshot of the product at the moment the order was placed. */
export interface OrderItem {
  productId: string;
  productCode: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  size?: string;
  color?: string;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  whatsapp: string;
  address: string;
  note?: string;
}

export interface OrderEvent {
  at: string;
  label: string;
}

export interface Order {
  id: string;
  /** Short code the customer sends on WhatsApp, e.g. SBM-7K42P */
  code: string;
  customer: CustomerInfo;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  history: OrderEvent[];
}

export interface CartLine {
  /** productId + variant, so the same dress in two sizes is two lines */
  key: string;
  productId: string;
  productCode: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
}
