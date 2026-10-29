import type { ReactNode } from "react";
import { Mascot, type MascotStage } from "@/components/brand/Mascot";

/** Inner-page header: eyebrow, large title, intro, optional actions, optional mascot on the right. */
export function PageHead({ eyebrow, title, body, children, dark = false, mark, mascot }: { eyebrow: string; title: ReactNode; body?: string; children?: ReactNode; dark?: boolean; mark?: ReactNode; mascot?: MascotStage }) {
  return (
    <section className={`${dark ? "surface-dark grain" : ""} relative pt-28 pb-12 md:pt-40 md:pb-16`}>
      <div className="gutter relative flex items-center gap-10">
        <div className="min-w-0 max-w-3xl flex-1 lg:w-[min(48rem,58%)] lg:flex-none">
          {mark ? <div className="mb-3">{mark}</div> : <p className="eyebrow-pill">{eyebrow}</p>}
          <h1 className={`display mt-3 text-[clamp(2.25rem,6vw,4.75rem)] [overflow-wrap:break-word] ${dark ? "text-paper" : ""}`}>{title}</h1>
          {body && <p className={`mt-5 text-lg md:text-xl ${dark ? "text-paper/65" : "text-muted"}`}>{body}</p>}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
        {mascot && <div className="hidden flex-1 justify-center lg:flex"><Mascot {...mascot} /></div>}
      </div>
    </section>
  );
}
