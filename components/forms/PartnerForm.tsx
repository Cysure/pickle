"use client";
import { useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { partnerSchema, fieldErrors } from "@/lib/validation";
import { CATEGORY_LABELS, type PerkCategory } from "@/lib/types";
import { Field, DemoTag } from "@/components/ui";
import { track } from "@/lib/analytics";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "success"; mode: "supabase" | "local" } | { kind: "error"; message: string };

export function PartnerForm() {
  const startedAt = useRef(Date.now());
  const [state, setState] = useState<State>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [v, setV] = useState({ businessName: "", contactName: "", email: "", city: "", country: "", category: "dining", message: "", consent: false, website: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...v, consent: v.consent as true, startedAt: startedAt.current };
    const parsed = partnerSchema.safeParse(payload);
    if (!parsed.success) { setErrors(fieldErrors(parsed.error)); return; }
    setErrors({});
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/partners", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json()) as { ok: boolean; mode?: "supabase" | "local"; error?: string; errors?: Record<string, string> };
      if (data.ok) { track("partner_application_submitted", { category: v.category }); setState({ kind: "success", mode: data.mode ?? "local" }); }
      else if (data.errors) { setErrors(data.errors); setState({ kind: "idle" }); }
      else setState({ kind: "error", message: data.error ?? "Something went wrong." });
    } catch {
      setState({ kind: "error", message: "We couldn't reach the server. Check your connection and try again." });
    }
  };

  if (state.kind === "success") {
    return (
      <div className="panel p-6 text-center sm:p-8" role="status">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-pickle text-night"><Check /></div>
        <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">Application received.</h3>
        <p className="mt-2 text-sm text-muted">
          {state.mode === "supabase"
            ? "Your application is saved. The partnerships team reviews applications as regions open."
            : "Local demo mode: your application was validated and accepted by this server but no backend is configured, so it was not stored and no email was sent."}
        </p>
        {state.mode === "local" && <DemoTag className="mt-3">Local demo mode</DemoTag>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Business name" htmlFor="pf-biz" error={errors.businessName}><input id="pf-biz" className="input" value={v.businessName} onChange={(e) => setV({ ...v, businessName: e.target.value })} /></Field>
      <Field label="Your name" htmlFor="pf-name" error={errors.contactName}><input id="pf-name" className="input" autoComplete="name" value={v.contactName} onChange={(e) => setV({ ...v, contactName: e.target.value })} /></Field>
      <Field label="Work email" htmlFor="pf-email" error={errors.email}><input id="pf-email" type="email" className="input" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
      <Field label="Category" htmlFor="pf-cat" error={errors.category}>
        <select id="pf-cat" className="select" value={v.category} onChange={(e) => setV({ ...v, category: e.target.value })}>
          {(Object.keys(CATEGORY_LABELS) as PerkCategory[]).map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </Field>
      <Field label="City" htmlFor="pf-city" error={errors.city}><input id="pf-city" className="input" value={v.city} onChange={(e) => setV({ ...v, city: e.target.value })} /></Field>
      <Field label="Country" htmlFor="pf-country" error={errors.country}><input id="pf-country" className="input" autoComplete="country-name" value={v.country} onChange={(e) => setV({ ...v, country: e.target.value })} /></Field>
      <div className="sm:col-span-2">
        <Field label="Tell us about your place (optional)" htmlFor="pf-msg" error={errors.message} hint="What kind of perk would you love to offer members?">
          <textarea id="pf-msg" className="textarea" rows={4} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} />
        </Field>
      </div>
      <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => setV({ ...v, website: e.target.value })} /></label></div>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="checkbox mt-0.5" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} />
          <span>I agree to Pickle storing these details to discuss a partnership, as described in the <a href="/privacy" className="underline">privacy notice</a>.</span>
        </label>
        {errors.consent && <p className="error mt-1" role="alert">{errors.consent}</p>}
      </div>
      {state.kind === "error" && <p className="error sm:col-span-2" role="alert">{state.message}</p>}
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary" disabled={state.kind === "loading"}>
          {state.kind === "loading" ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Become a Pickle Partner"}
        </button>
      </div>
    </form>
  );
}
