import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { DemoTag, Toaster } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Merchant portal demo", robots: { index: false } };

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/90 backdrop-blur">
        <div className="gutter flex h-16 items-center justify-between">
          <div className="flex items-center gap-3"><Link href="/merchant" aria-label="Merchant portal home"><Logo width={140} /></Link><span className="hidden h-5 w-px bg-ink/15 sm:block" /><span className="hidden text-sm font-semibold sm:block">Merchant portal</span><DemoTag>Demo</DemoTag></div>
          <nav className="flex items-center gap-2 text-sm" aria-label="Merchant">
            <Link href="/merchant" className="btn btn-ghost btn-sm">Dashboard</Link>
            <Link href="/merchant/offers/new" className="btn btn-primary btn-sm">New offer</Link>
            <Link href="/" className="hidden items-center gap-1 text-muted hover:text-ink sm:inline-flex"><ArrowLeft size={14} /> Site</Link>
          </nav>
        </div>
      </header>
      <main className="gutter py-8 md:py-12">{children}</main>
      <Toaster />
    </div>
  );
}
