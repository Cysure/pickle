"use client";
import { useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { waitlistSchema, fieldErrors } from "@/lib/validation";
import { Field, DemoTag } from "@/components/ui";
import { track } from "@/lib/analytics";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "success"; mode: "supabase" | "local" } | { kind: "error"; message: string };

const COUNTRIES = ["United Kingdom", "United Arab Emirates", "Saudi Arabia", "Germany", "France", "Spain", "Netherlands", "Ireland", "United States", "Canada", "Australia", "Singapore", "Other"];

export function EarlyAccessForm({ compact = false }: { compact?: boolean }) {
  const startedAt = useRef(Date.now());
  const [state, setState] = useState<State>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [v, setV] = useState({ firstName: "", email: "", country: "", interest: "everything", cardStyle: "", consent: false, website: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...v, consent: v.consent as true, startedAt: startedAt.current };
    const parsed = waitlistSchema.safeParse(payload);
    if (!parsed.success) { setErrors(fieldErrors(parsed.error)); return; }
    setErrors({});
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json()) as { ok: boolean; mode?: "supabase" | "local"; error?: string; errors?: Record<string, string>; duplicate?: boolean };
      if (data.ok) {
        track("waitlist_submitted", { interest: v.interest, country: v.country });
        setState({ kind: "success", mode: data.mode ?? "local" });
      } else if (data.errors) {
        setErrors(data.errors); setState({ kind: "idle" });
      } else {
        setState({ kind: "error", message: data.error ?? "Something went wrong." });
      }
    } catch {
      setState({ kind: "error", message: "We couldn't reach the server. Check your connection and try again." });
    }
  };

  if (state.kind === "success") {
    return (
      <div className="panel p-6 text-center sm:p-8" role="status">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-pickle text-night"><Check /></div>
        <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">You&rsquo;re on the list.</h3>
        <p className="mt-2 text-sm text-muted">
          {state.mode === "supabase"
            ? "Your details are saved. We'll be in touch when Pickle opens in your region."
            : "Local demo mode: your details were validated and accepted by this server but no backend is configured, so nothing was stored or emailed."}
        </p>
        {state.mode === "local" && <DemoTag className="mt-3">Local demo mode</DemoTag>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
      <Field label="First name" htmlFor="ea-first" error={errors.firstName}>
        <input id="ea-first" className="input" autoComplete="given-name" value={v.firstName} onChange={(e) => setV({ ...v, firstName: e.target.value })} />
      </Field>
      <Field label="Email" htmlFor="ea-email" error={errors.email}>
        <input id="ea-email" type="email" className="input" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
      </Field>
      <Field label="Country" htmlFor="ea-country" error={errors.country}>
        <select id="ea-country" className="select" value={v.country} onChange={(e) => setV({ ...v, country: e.target.value })}>
          <option value="">Choose…</option>
          {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="What are you most into?" htmlFor="ea-interest" error={errors.interest}>
        <select id="ea-interest" className="select" value={v.interest} onChange={(e) => setV({ ...v, interest: e.target.value })}>
          <option value="everything">A bit of everything</option><option value="pool-beach">Pool & Beach</option><option value="bars-clubs">Bars & Clubs</option><option value="dining">Dining</option><option value="family">Family</option><option value="spa-fitness">Spa & Fitness</option>
        </select>
      </Field>
      <Field label="Preferred card style (optional)" htmlFor="ea-style" error={errors.cardStyle}>
        <select id="ea-style" className="select" value={v.cardStyle} onChange={(e) => setV({ ...v, cardStyle: e.target.value })}>
          <option value="">No preference</option><option value="green">Pickle Green</option><option value="black">Pickle Black</option><option value="reserve">Pickle Reserve</option>
        </select>
      </Field>
      {/* honeypot */}
      <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => setV({ ...v, website: e.target.value })} /></label></div>
      <div className={compact ? "" : "sm:col-span-2"}>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="checkbox mt-0.5" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} />
          <span>I agree to Pickle storing my details to contact me about early access, as described in the <a href="/privacy" className="underline">privacy notice</a>.</span>
        </label>
        {errors.consent && <p className="error mt-1" role="alert">{errors.consent}</p>}
      </div>
      {state.kind === "error" && <p className={`error ${compact ? "" : "sm:col-span-2"}`} role="alert">{state.message}</p>}
      <div className={compact ? "" : "sm:col-span-2"}>
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={state.kind === "loading"}>
          {state.kind === "loading" ? <><Loader2 size={16} className="animate-spin" /> Joining…</> : "Join Pickle"}
        </button>
        <p className="mt-3 text-xs text-muted">No card is issued by joining. Early access is a waiting list for the Pickle programme as it becomes available.</p>
      </div>
    </form>
  );
}
