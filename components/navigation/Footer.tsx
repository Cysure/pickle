import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { Logo } from "@/components/brand/Logo";
import { NAV, LAUNCH } from "@/lib/config";
import { PHOTO_CREDITS } from "@/lib/photos";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-[#060706] text-paper">
      <div className="gutter relative py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo width={200} color="#77C300" />
            <p className="mt-6 max-w-xs font-display text-2xl font-bold tracking-tight text-paper">Your VIP pass to the good life.</p>
            <p className="mt-3 max-w-sm text-sm text-paper/60">Pickle Perks is a membership: subscribe once and get perks across Pool &amp; Beach, Bars &amp; Clubs, Dining, Family and Spa &amp; Fitness at registered partners. Life&rsquo;s Better with Pickle.</p>
            <Link href="/early-access" className="btn btn-primary mt-6">Get Early Access</Link>
          </div>
          <FooterCol title="Perks" links={NAV.footer.perks} />
          <FooterCol title="Pickle" links={NAV.footer.more} />
          <FooterCol title="Legal" links={NAV.footer.legal} />
        </div>
        <div className="mt-16 overflow-hidden" aria-hidden="true">
          <Wordmark width="100%" color="rgba(119,195,0,0.12)" className="block translate-y-[18%]" title="" />
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-paper/10 pt-6 text-xs text-paper/50 md:flex-row md:items-center md:justify-between">
          <div><p>&copy; {year} Pickle. All rights reserved.</p>{PHOTO_CREDITS.length > 0 && <p className="mt-1 max-w-md">Photography via Openverse: {PHOTO_CREDITS.map((p, i) => <span key={p.credit}>{i > 0 && ", "}<a href={p.source} target="_blank" rel="noreferrer" className="underline decoration-paper/30 hover:text-paper">{p.credit.replace("Photo: ", "")}</a></span>)}.</p>}</div>
          <p className="max-w-2xl">
            Pickle Perks is a membership programme in development; plans shown are proposed and not yet for sale. Pickle is not a bank. The Pickle Card is a future product and will be issued by a licensed partner
            {LAUNCH.issuer ? ` (${LAUNCH.issuer})` : " to be announced"} and is subject to eligibility and local availability. Perks, merchants and transactions shown on this site are illustrative demos.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <p className="eyebrow-pill">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-paper/75 transition-colors hover:text-paper">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
