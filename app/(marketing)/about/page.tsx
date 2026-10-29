import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/marketing/PageHead";
import { SectionHead } from "@/components/marketing/Sections";
import { Reveal, Stagger, Item } from "@/components/motion/Reveal";
import { Wordmark } from "@/components/brand/Wordmark";
import { MascotTag } from "@/components/brand/Mascot";

export const metadata: Metadata = { title: "About" };

const VALUES = [
  ["Honest first", "We'd rather say 'to be confirmed' than invent a launch date, a partner or a saving."],
  ["Perks, not points", "Points ask you to do maths. A pastry with your coffee doesn't."],
  ["Local by design", "Pickle is built around the places near you, not a catalogue of chains."],
  ["Quietly good", "The card should feel like a nice object, and the app should get out of the way."],
];

export default function AboutPage() {
  return (
    <>
      <PageHead mascot={{ flip: true, bubble: "Built for Saturdays, not spreadsheets.", note: "Perks, not points", stat: { value: "5", label: "ways in" }, prop: <MascotTag>Est. 2026</MascotTag> }} eyebrow="About" title={<>Life&rsquo;s Better <span className="text-pickle">with Pickle.</span></>} body="Pickle started with a simple observation: the best parts of a week are small and local, and they deserve a better card." />
      <section className="gutter grid gap-12 pb-20 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-5 text-lg text-muted">
            <p>Most rewards programmes are built for spreadsheets. Pickle is built for Saturday. Pickle Perks is a subscription that gets you into the best pools and beach clubs in Bali for free, onto the guest list at bars and clubs, discounts when you dine, the kids' clubs and parks your family actually wants, and the gyms and spas in between, the way membership clubs work in the Gulf but with Bali's pace. The Pickle Card comes next.</p>
            <p>Pickle is a lifestyle and perks programme in development. We are not a bank. Any card will be issued by a licensed partner under its own terms. Until then, everything you can try on this site is an early preview, clearly labelled as a demo.</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="surface-green grain relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[var(--radius-card)] p-10">
            <Wordmark width="70%" color="#101110" />
            <span className="absolute bottom-6 left-6 eyebrow !text-night/70">Est. in development · 2026</span>
          </div>
        </Reveal>
      </section>
      <section className="surface-dark grain py-20 md:py-28">
        <div className="gutter">
          <SectionHead dark eyebrow="What we believe" title="Four things we won't compromise on." />
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2">
            {VALUES.map(([t, b]) => <Item key={t}><div className="panel-dark shine h-full p-6"><h3 className="font-display text-xl font-bold text-paper">{t}</h3><p className="mt-2 text-paper/60">{b}</p></div></Item>)}
          </Stagger>
          <div className="mt-12 flex flex-wrap gap-3"><Link href="/early-access" className="btn btn-primary">Get Early Access</Link><Link href="/partners" className="btn btn-ghost !text-paper">Partner with us</Link></div>
        </div>
      </section>
    </>
  );
}
