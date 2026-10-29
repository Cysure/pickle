"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X, ChevronDown, Sparkles, MapPin, ListChecks, Gift, Radar, Users, Smartphone, Rocket, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { TOP_NAV, PERKS_CATEGORIES, PERKS_LINKS, type NavLink } from "@/lib/nav";
import { PHOTOS } from "@/lib/photos";
import { ACCESS_VENUES } from "@/lib/demo/access";

const ICONS: Record<NavLink["icon"], typeof Sparkles> = {
  sparkles: Sparkles, "map-pin": MapPin, "list-checks": ListChecks, gift: Gift, radar: Radar, users: Users, smartphone: Smartphone, rocket: Rocket,
};

function PickleDot({ size = 18 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/pickle-icon.png" alt="" aria-hidden="true" width={size} height={size} className="shrink-0 -rotate-12 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" draggable={false} />;
}

export function MarketingNav() {
  const path = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);          // mobile sheet
  const [mega, setMega] = useState(false);          // desktop Perks mega menu
  const [mobilePerks, setMobilePerks] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpenedAt = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const onDark = path === "/" && !scrolled && !open && !mega;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setOpen(false); setMega(false); }, [path]);
  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMega(false); };
    const onDown = (e: MouseEvent) => { if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMega(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [mega]);

  const openMega = useCallback(() => { if (closeTimer.current) clearTimeout(closeTimer.current); setMega((v) => { if (!v) hoverOpenedAt.current = Date.now(); return true; }); }, []);
  // a click right after hover-open (the same gesture) keeps it open; a later click toggles
  const clickMega = useCallback(() => setMega((v) => (v && Date.now() - hoverOpenedAt.current > 400 ? false : true)), []);
  const closeMegaSoon = useCallback(() => { if (closeTimer.current) clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setMega(false), 160); }, []);

  const isActive = (key: string, href: string) => {
    if (key === "perks") return path === "/perks" || path === "/access" || path === "/how-it-works" || path === "/early-access";
    return path === href;
  };
  const linkTone = (active: boolean) => (active ? "text-pickle" : onDark ? "text-paper" : "text-ink");

  return (
    <header ref={headerRef} className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open || mega ? "bg-paper/95 backdrop-blur-md shadow-[0_1px_0_rgba(23,25,20,0.08)]" : "bg-transparent"}`} onMouseLeave={closeMegaSoon}>
      <nav className="gutter flex h-16 items-center justify-between md:h-20" aria-label="Main">
        <Link href="/" className="flex items-center" aria-label="Pickle home">
          <Logo width={160} color={onDark ? "#FAFAF6" : "#77C300"} />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {TOP_NAV.map((item) => {
            const active = isActive(item.key, item.href);
            if (item.key === "perks") {
              return (
                <li key={item.key} onMouseEnter={openMega}>
                  <button type="button" aria-expanded={mega} aria-controls="perks-mega" onClick={clickMega}
                    className={`group flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold transition-colors hover:text-pickle ${mega ? "bg-cream text-ink" : linkTone(active)}`}>
                    {item.label}
                    <ChevronDown size={15} className={`transition-transform duration-300 ${mega ? "rotate-180" : ""}`} />
                  </button>
                </li>
              );
            }
            return (
              <li key={item.key} onMouseEnter={closeMegaSoon}>
                <Link href={item.href} className={`group flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold transition-colors hover:text-pickle ${linkTone(active)}`}>
                  {item.label}
                  {"badge" in item && item.badge && <span className="rounded-full bg-pickle px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-night">{item.badge}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/app" className={`btn btn-ghost btn-sm ${onDark ? "!border-paper/30 !text-paper hover:!bg-paper/10" : ""}`}>Open app demo</Link>
          <Link href="/pricing" className="btn btn-primary btn-sm">See plans</Link>
        </div>
        <button type="button" className={`rounded-full p-2 lg:hidden ${onDark ? "text-paper" : ""}`} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Desktop mega menu */}
      <AnimatePresence>
        {mega && (
          <motion.div id="perks-mega" key="mega" onMouseEnter={openMega}
            initial={reduce ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full hidden lg:block">
            <div className="gutter pb-6">
              <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_40px_90px_-30px_rgba(16,17,16,0.4)] ring-1 ring-ink/5">
                <div className="grid grid-cols-[1.35fr_1fr_0.85fr]">
                  {/* categories */}
                  <div className="flex flex-col p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="flex items-center gap-2 font-display text-lg font-bold"><PickleDot size={20} /> Five ways in</p>
                      <Link href="/access" className="flex items-center gap-1 text-xs font-semibold text-pickle hover:underline">All {ACCESS_VENUES.length} partners <ArrowRight size={12} /></Link>
                    </div>
                    <div className="grid min-h-[320px] flex-1 grid-cols-6 grid-rows-[1.25fr_1fr] gap-3">
                      {PERKS_CATEGORIES.map((c, i) => {
                        const p = PHOTOS[c.photo];
                        const n = ACCESS_VENUES.filter((v) => v.category === c.cat).length;
                        return (
                          <Link key={c.cat} href={`/access#${c.cat}`} className={`group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-night p-3 text-paper ring-1 ring-inset ring-white/10 ${i < 2 ? "col-span-3" : "col-span-2"}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.src} alt="" loading="lazy" style={{ objectPosition: p.position }} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                            <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,17,16,0.88),rgba(16,17,16,0.15)_65%,transparent)]" />
                            <span className="relative flex items-end justify-between gap-2">
                              <span><span className="block font-display text-sm font-bold leading-tight">{c.label}</span><span className="block text-[10px] font-semibold uppercase tracking-wider text-paper/70">{c.line}</span></span>
                              <span className="num font-display text-xl font-bold text-pickle">{n}</span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                  {/* links */}
                  <div className="border-x border-ink/5 bg-cream/40 p-6">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">Everything Perks</p>
                    <ul className="space-y-0.5">
                      {PERKS_LINKS.map((l) => {
                        const Icon = ICONS[l.icon];
                        return (
                          <li key={l.href}>
                            <Link href={l.href} className="group flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-white">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-ink ring-1 ring-ink/5 transition-colors group-hover:bg-pickle group-hover:text-night"><Icon size={16} /></span>
                              <span><span className="block text-sm font-semibold leading-tight">{l.label}</span><span className="block text-xs text-muted">{l.blurb}</span></span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* feature */}
                  <Link href="/pricing" className="group relative flex flex-col justify-end overflow-hidden bg-night p-6 text-paper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={PHOTOS.hero.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[30%_60%] transition-transform duration-700 ease-out group-hover:scale-105" />
                    <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,17,16,0.92),rgba(16,17,16,0.25)_70%)]" />
                    <span className="relative">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-pickle px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-night">VIP pass</span>
                      <span className="mt-3 block font-display text-2xl font-bold leading-tight">Your VIP pass to the good life.</span>
                      <span className="mt-2 block text-sm text-paper/70">One membership. Solo, Duo or Family.</span>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-pickle">See pricing <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sheet */}
      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-ink/10 bg-paper lg:hidden">
          <div className="gutter pb-8 pt-2">
            <button type="button" onClick={() => setMobilePerks((v) => !v)} aria-expanded={mobilePerks} className="group flex w-full items-center justify-between py-3 font-display text-lg font-semibold">
              <span>Perks</span>
              <ChevronDown size={18} className={`transition-transform ${mobilePerks ? "rotate-180" : ""}`} />
            </button>
            {mobilePerks && (
              <div className="pb-3">
                <div className="grid grid-cols-2 gap-2">
                  {PERKS_CATEGORIES.map((c) => {
                    const p = PHOTOS[c.photo];
                    return (
                      <Link key={c.cat} href={`/access#${c.cat}`} className="relative flex aspect-[16/10] items-end overflow-hidden rounded-2xl bg-night p-2.5 text-paper">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.src} alt="" loading="lazy" style={{ objectPosition: p.position }} className="absolute inset-0 h-full w-full object-cover" />
                        <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,17,16,0.85),transparent_70%)]" />
                        <span className="relative font-display text-sm font-bold">{c.label}</span>
                      </Link>
                    );
                  })}
                </div>
                <ul className="mt-3 grid grid-cols-1 gap-0.5">
                  {PERKS_LINKS.map((l) => {
                    const Icon = ICONS[l.icon];
                    return <li key={l.href}><Link href={l.href} className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold"><Icon size={16} className="text-pickle" /> {l.label}</Link></li>;
                  })}
                </ul>
              </div>
            )}
            {TOP_NAV.filter((i) => i.key !== "perks").map((item) => (
              <Link key={item.key} href={item.href} className="group flex items-center gap-2.5 border-t border-ink/5 py-3 font-display text-lg font-semibold">
                {item.label}
                {"badge" in item && item.badge && <span className="rounded-full bg-pickle px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-night">{item.badge}</span>}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/pricing" className="btn btn-primary">See plans</Link>
              <Link href="/app" className="btn btn-ghost">Open app demo</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
