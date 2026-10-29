import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Pickle Perks — Your VIP pass to the good life", template: "%s — Pickle" },
  description:
    "Pickle Perks is a membership: subscribe to one plan and get perks across Pool & Beach, Bars & Clubs, Dining, Family and Spa & Fitness in Bali. Check in with the app, pay nothing at the door. Pickle Card coming soon.",
  openGraph: {
    title: "Pickle — Life's Better with Pickle",
    description: "Your VIP pass to the good life. Privileged access at registered partners on one membership.",
    images: [{ url: "/brand/pickle-wordmark.png", width: 2048, height: 764, alt: "Pickle" }],
  },
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/brand/favicon.ico",
    apple: "/brand/apple-touch-icon.png",
  },
};

export const viewport: Viewport = { themeColor: "#77C300", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-paper text-ink">
        <Script id="first-frame" strategy="beforeInteractive">{"requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.classList.add('fr')})})"}</Script>
        {children}
      </body>
    </html>
  );
}
