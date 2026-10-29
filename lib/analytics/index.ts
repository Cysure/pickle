/**
 * Analytics abstraction. Events are typed; the sink is pluggable. With no
 * provider configured, events go to a local console logger in development
 * and are dropped in production. No personal data is attached to events.
 */
export type AnalyticsEvent =
  | { name: "waitlist_submitted"; props: { interest: string; country: string } }
  | { name: "partner_application_submitted"; props: { category: string } }
  | { name: "perk_viewed"; props: { perkId: string; category: string } }
  | { name: "perk_saved"; props: { perkId: string } }
  | { name: "perk_unsaved"; props: { perkId: string } }
  | { name: "radar_opened"; props: { view: "map" | "list" } }
  | { name: "card_design_changed"; props: { design: string } }
  | { name: "card_frozen_toggled"; props: { frozen: boolean } }
  | { name: "plan_created"; props: { perkCount: number } }
  | { name: "offer_shared"; props: { perkId: string; method: "copy" | "share" } }
  | { name: "app_demo_opened"; props: Record<string, never> }
  | { name: "merchant_offer_saved"; props: { status: string } };

export interface AnalyticsSink {
  track(e: AnalyticsEvent): void;
}

const consoleSink: AnalyticsSink = {
  track(e) {
    if (process.env.NODE_ENV !== "production") console.debug("[analytics]", e.name, e.props);
  },
};

let sink: AnalyticsSink = consoleSink;

/** Swap the sink (e.g. for a real provider or in tests). */
export function setAnalyticsSink(s: AnalyticsSink) {
  sink = s;
}

export function track<E extends AnalyticsEvent>(name: E["name"], props: E["props"]) {
  try {
    sink.track({ name, props } as AnalyticsEvent);
  } catch {
    /* analytics must never break the product */
  }
}
