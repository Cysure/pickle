import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Toaster } from "@/components/ui";
import { leadsEnabled } from "@/lib/leads/runner";

export const metadata: Metadata = { title: "Bali partner leads", robots: { index: false, follow: false } };

// Internal tool: drives Docker + Python on this machine and shows scraped contact details,
// so it only exists in dev unless LEADS_DASHBOARD=1 is set explicitly.
export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  if (!leadsEnabled()) notFound();
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/90 backdrop-blur">
        <div className="gutter flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/leads" aria-label="Leads home"><Logo width={130} /></Link>
            <span className="hidden h-5 w-px bg-ink/15 sm:block" />
            <span className="hidden text-sm font-semibold sm:block">Partner leads</span>
            <span className="pill-outline">Internal</span>
          </div>
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={14} /> Site</Link>
        </div>
      </header>
      <main className="gutter py-8 md:py-10">{children}</main>
      <Toaster />
    </div>
  );
}
