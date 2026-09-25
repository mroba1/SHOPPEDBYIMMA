import type { Metadata, Viewport } from "next";
import { Caveat, Cormorant_Garamond, Josefin_Sans, Manrope } from "next/font/google";
import { site } from "@/lib/config";
import "./globals.css";

// Manrope: clean modern UI · Josefin Sans: the flyer's airy wordmark
// Cormorant: editorial italics (inspired by the reference UI) · Caveat: the handwritten tagline only
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const josefin = Josefin_Sans({ variable: "--font-josefin", subsets: ["latin"], weight: ["300", "400"] });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: `${site.description} Fashion accessories, footwear, sleepwear, jewelry, kids wear and home finds — order online, confirm on WhatsApp.`,
  openGraph: { title: site.name, description: site.description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#292823",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${josefin.variable} ${cormorant.variable} ${caveat.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
