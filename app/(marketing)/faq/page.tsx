import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/marketing/PageHead";
import { FAQ } from "@/components/marketing/FAQ";
import { MascotTag } from "@/components/brand/Mascot";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <>
      <PageHead mascot={{ bubble: "Is entry really free? At Pool & Beach, yes.", note: "No fine-print games", prop: <MascotTag>Plain answers</MascotTag> }} eyebrow="FAQ" title={<>Questions, <span className="text-pickle">answered carefully.</span></>} body="Where something isn't decided yet, we say so. Launch regions, timing and the issuing partner are confirmed here as soon as they're real." />
      <section className="gutter max-w-4xl pb-24">
        <FAQ />
        <p className="mt-8 text-sm text-muted">Still wondering about something? <Link href="/early-access" className="underline">Join early access</Link> and ask us when we write.</p>
      </section>
    </>
  );
}
