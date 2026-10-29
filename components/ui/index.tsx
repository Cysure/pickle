"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { X, Check, Copy } from "lucide-react";

type BtnVariant = "primary" | "dark" | "ghost";
export function Button({
  href, variant = "primary", size, className = "", children, type = "button", onClick, disabled, arrow,
}: {
  href?: string; variant?: BtnVariant; size?: "sm"; className?: string; children: ReactNode;
  type?: "button" | "submit"; onClick?: () => void; disabled?: boolean; arrow?: boolean;
}) {
  const cls = `btn btn-${variant} ${size === "sm" ? "btn-sm" : ""} ${className}`;
  const inner = (<>{children}{arrow && <span className="arrow" aria-hidden="true">→</span>}</>);
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button type={type} className={cls} onClick={onClick} disabled={disabled}>{inner}</button>;
}

export function Pill({ tone = "green", children, className = "" }: { tone?: "green" | "lime" | "dark" | "outline"; children: ReactNode; className?: string }) {
  return <span className={`pill-${tone} ${className}`}>{children}</span>;
}

/** Every simulated thing in the product wears one of these. */
export function DemoTag({ children = "Demo", className = "" }: { children?: ReactNode; className?: string }) {
  return <span className={`demo-tag ${className}`}>{children}</span>;
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-night/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose} role="presentation">
      <div
        role="dialog" aria-modal="true" aria-label={title}
        className={`panel max-h-[92vh] w-full overflow-y-auto rounded-b-none p-6 sm:rounded-b-[var(--radius-card)] sm:p-8 ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-cream"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function EmptyState({ title, body, action, icon }: { title: string; body: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center gap-3 px-6 py-12 text-center">
      {icon && <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cream text-pickle">{icon}</div>}
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{body}</p>
      {action}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="toggle" onClick={() => onChange(!checked)}>
      <span className="toggle-knob" />
    </button>
  );
}

export function CopyButton({ text, label = "Copy link", onCopied }: { text: string; label?: string; onCopied?: () => void }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      onCopied?.();
      setTimeout(() => setDone(false), 1800);
    } catch {
      toast("Copying is blocked in this browser. The link is shown below.", "dark");
    }
  };
  return (
    <button type="button" onClick={copy} className="btn btn-ghost btn-sm">
      {done ? <Check size={14} /> : <Copy size={14} />} {done ? "Copied" : label}
    </button>
  );
}

/* --- toasts --- */
type ToastItem = { id: number; text: string; tone?: "green" | "dark" };
let pushToast: ((t: Omit<ToastItem, "id">) => void) | null = null;
export function toast(text: string, tone: ToastItem["tone"] = "green") { pushToast?.({ text, tone }); }

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    pushToast = (t) => {
      const id = Date.now() + Math.random();
      setItems((s) => [...s, { ...t, id }]);
      setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 2600);
    };
    return () => { pushToast = null; };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[95] flex flex-col items-center gap-2 px-4 sm:bottom-6" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`pointer-events-auto rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${t.tone === "dark" ? "bg-night text-paper" : "bg-pickle text-night"}`}>{t.text}</div>
      ))}
    </div>
  );
}

/* --- form fields --- */
export function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
