import type { Metadata } from "next";
import Link from "next/link";
import { Store, LayoutDashboard, HelpCircle, Rocket } from "lucide-react";
import { PageHead } from "@/components/marketing/PageHead";
import { ContactForm } from "@/components/forms/ContactForm";
import { Reveal, Stagger, Item } from "@/components/motion/Reveal";
import { MascotTag } from "@/components/brand/Mascot";

export const metadata: Metadata = { title: "Contact" };

const ROUTES = [
  { icon: Store, t: "List your venue", b: "Become a registered partner.", href: "/partners" },
  { icon: LayoutDashboard, t: "Merchant portal", b: "Try the partner dashboard demo.", href: "/merchant" },
  { icon: HelpCircle, t: "FAQ", b: "Quick answers, carefully worded.", href: "/faq" },
  { icon: Rocket, t: "Early access", b: "Be first in when plans open.", href: "/early-access" },
];

export default function ContactPage() {
  return (
    <>
      <PageHead mascot={{ flip: true, bubble: "Membership, pricing or partnering? Ask us.", note: "We read every message", prop: <MascotTag>Say hello</MascotTag> }} eyebrow="Contact" title={<>Say <span className="text-pickle">hello</span>.</>} body="Questions about membership, pricing or partnering with Pickle. We read every message." />
      <section className="gutter grid gap-10 pb-24 lg:grid-cols-[1.2fr_0.8fr]">
        <Reveal><div className="panel p-6 md:p-8"><ContactForm /></div></Reveal>
        <Stagger className="grid content-start gap-3">
          {ROUTES.map(({ icon: Icon, t, b, href }) => (
            <Item key={href}>
              <Link href={href} className="panel hover-lift group flex items-center gap-4 p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-night text-pickle transition-transform group-hover:-rotate-6"><Icon size={20} /></span>
                <span><span className="block font-display text-lg font-bold">{t}</span><span className="block text-sm text-muted">{b}</span></span>
              </Link>
            </Item>
          ))}
        </Stagger>
      </section>
    </>
  );
}
