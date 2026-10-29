"use client";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const up: Variants = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const EASE = [0.16, 1, 0.3, 1] as const;

/** Scroll-triggered reveal. With reduced motion the content renders in place. */
export function Reveal({ children, delay = 0, className = "", y = 24 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div data-reveal className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10% 0px" }} transition={{ duration: 0.7, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}

/** Stagger container: children that are <Item> animate one after another. */
export function Stagger({ children, className = "", gap = 0.08 }: { children: ReactNode; className?: string; gap?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div data-reveal className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10% 0px" }} transition={{ staggerChildren: gap }}>
      {children}
    </motion.div>
  );
}
export function Item({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return <motion.div data-reveal className={className} variants={up} transition={{ duration: 0.6, ease: EASE }}>{children}</motion.div>;
}

/** Infinite horizontal marquee of children (duplicated for a seamless loop). */
export function Marquee({ children, className = "", speed = 40 }: { children: ReactNode; className?: string; speed?: number }) {
  return (
    <div className={`marquee ${className}`} style={{ ["--marquee-speed" as string]: `${speed}s` }}>
      <div className="marquee-track">{children}{children}</div>
    </div>
  );
}
