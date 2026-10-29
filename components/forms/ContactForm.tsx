"use client";
import { useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { Field, DemoTag } from "@/components/ui";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "success"; mode: "supabase" | "local" } | { kind: "error"; message: string };

const TOPICS = [
  ["membership", "Membership & perks"],
  ["pricing", "Pricing & plans"],
  ["partnership", "Becoming a partner"],
  ["press", "Press"],
  ["support", "App demo help"],
  ["other", "Something else"],
] as const;

export function ContactForm({ initialTopic = "membership" }: { initialTopic?: (typeof TOPICS)[number][0] }) {
  const startedAt = useRef(Date.now());
  const [state, setState] = useState<State>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [v, setV] = useState({ name: "", email: "", topic: initialTopic as string, message: "", consent: false, website: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...v, consent: v.consent as true, startedAt: startedAt.current };
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) { setErrors(fieldErrors(parsed.error)); return; }
    setErrors({});
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json()) as { ok: boolean; mode?: "supabase" | "local"; error?: string; errors?: Record<string, string> };
      if (data.ok) setState({ kind: "success", mode: data.mode ?? "local" });
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
        <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">Message received.</h3>
        <p className="mt-2 text-sm text-muted">
          {state.mode === "supabase"
            ? "Thanks. Your message is saved and the team will reply by email."
            : "Local demo mode: your message was validated and accepted by this server but no backend is configured, so it was not stored and no email was sent."}
        </p>
        {state.mode === "local" && <DemoTag className="mt-3">Local demo mode</DemoTag>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Your name" htmlFor="cf-name" error={errors.name}><input id="cf-name" className="input" autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
      <Field label="Email" htmlFor="cf-email" error={errors.email}><input id="cf-email" type="email" className="input" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></Field>
      <div className="sm:col-span-2">
        <span className="text-sm font-semibold">What's it about?</span>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Topic">
          {TOPICS.map(([id, label]) => (
            <button key={id} type="button" role="radio" aria-checked={v.topic === id} onClick={() => setV({ ...v, topic: id })} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${v.topic === id ? "bg-pickle text-night" : "bg-cream hover:bg-ink/10"}`}>{label}</button>
          ))}
        </div>
        {errors.topic && <p className="error mt-1" role="alert">{errors.topic}</p>}
      </div>
      <div className="sm:col-span-2">
        <Field label="Message" htmlFor="cf-msg" error={errors.message}><textarea id="cf-msg" className="textarea" rows={5} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} /></Field>
      </div>
      <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => setV({ ...v, website: e.target.value })} /></label></div>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="checkbox mt-0.5" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} />
          <span>I agree to Pickle storing these details to reply to me, as described in the <a href="/privacy" className="underline">privacy notice</a>.</span>
        </label>
        {errors.consent && <p className="error mt-1" role="alert">{errors.consent}</p>}
      </div>
      {state.kind === "error" && <p className="error sm:col-span-2" role="alert">{state.message}</p>}
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary" disabled={state.kind === "loading"}>
          {state.kind === "loading" ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Send message"}
        </button>
      </div>
    </form>
  );
}
