import type { ReactNode } from "react";

/**
 * Hero pop-ups beside inner-page titles: a light notification card with the
 * pickle icon, a small black note, a green tag and an optional stat, each
 * popping in on arrival and floating gently. (Replaces the mascot character;
 * the PageHead prop is still called `mascot` so pages don't need to change.)
 */
export type MascotStage = {
  src?: string;
  flip?: boolean;
  tilt?: number;
  motion?: "float" | "sway" | "bounce" | "peek" | "none";
  /** main notification line */
  bubble?: ReactNode;
  /** small black chip */
  note?: ReactNode;
  /** green tag */
  prop?: ReactNode;
  /** big number with a label */
  stat?: { value: string; label: string };
  size?: number;
};

export function Mascot({ flip, motion = "float", bubble, note, prop, stat }: MascotStage) {
  const float = motion === "none" ? "" : "mascot-float";
  const side = flip ? "right-0" : "left-0";
  const otherSide = flip ? "left-0" : "right-0";
  return (
    <div aria-hidden="true" className="pointer-events-none relative hidden h-[380px] w-[440px] select-none lg:block">
      {/* the Pickle icon as the centrepiece; the words pop in around it */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="hero-pickle-glow absolute inset-[-30%] rounded-full" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/pickle-icon.png" alt="" width={1024} height={1024} draggable={false}
          className={`hero-pickle relative h-[200px] w-[200px] ${flip ? "hero-pickle-flip" : ""}`} />
      </div>
      {bubble && (
        <div className={`absolute top-0 z-10 ${side} ${float}`}>
          <div className="popup-in flex w-[290px] items-start gap-3 rounded-[22px] bg-[#F1F2EE] p-4 shadow-[0_26px_50px_-26px_rgba(16,17,16,0.4)] ring-1 ring-ink/5" style={{ animationDelay: "0.2s" }}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white ring-1 ring-ink/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/pickle-icon.png" alt="" className="h-6 w-6 -rotate-12" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Pickle <span className="font-medium normal-case tracking-normal">now</span></span>
              <span className="mt-1 block font-display text-base font-bold leading-snug text-ink">{bubble}</span>
            </span>
          </div>
        </div>
      )}
      {note && (
        <div className={`absolute top-[44%] z-10 ${otherSide} ${float}`} style={{ animationDelay: "-2.2s" }}>
          <span className="popup-in inline-flex -rotate-2 items-center gap-1.5 rounded-full bg-night px-3.5 py-2 text-xs font-semibold text-paper shadow-[0_16px_30px_-14px_rgba(16,17,16,0.6)]" style={{ animationDelay: "0.55s" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-pickle" />{note}
          </span>
        </div>
      )}
      {stat && (
        <div className={`absolute bottom-0 z-10 ${side} ${float}`} style={{ animationDelay: "-3.4s" }}>
          <div className="popup-in rounded-[20px] bg-night px-5 py-3.5 text-paper shadow-[0_22px_40px_-20px_rgba(16,17,16,0.6)]" style={{ animationDelay: "0.85s" }}>
            <span className="num block font-display text-3xl font-bold leading-none text-pickle">{stat.value}</span>
            <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/70">{stat.label}</span>
          </div>
        </div>
      )}
      {prop && (
        <div className={`absolute bottom-4 z-10 ${stat ? otherSide : side} ${float}`} style={{ animationDelay: "-1.2s" }}>
          <div className="popup-in" style={{ animationDelay: "1.1s" }}>{prop}</div>
        </div>
      )}
    </div>
  );
}

/** Green tag pop-up. */
export function MascotTag({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "dark" | "white" }) {
  const t = tone === "green" ? "bg-pickle text-night" : tone === "dark" ? "bg-night text-pickle" : "bg-white text-night ring-1 ring-ink/10";
  return <span className={`inline-flex rotate-3 items-center gap-1.5 rounded-2xl px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wider shadow-[0_20px_40px_-18px_rgba(16,17,16,0.5)] ${t}`}>{children}</span>;
}
