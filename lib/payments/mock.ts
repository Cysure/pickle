import type { CardApplicationStatus, CardMetadata, PaymentProvider, TransactionEvent, WebhookEnvelope } from "./types";
import { verifySignature } from "./webhook";
import { ACTIVITY } from "@/lib/demo/data";

/**
 * Mock provider. Visibly a simulation: every object it returns carries
 * `simulated: true` and the UI labels it as such. State lives in memory for
 * the lifetime of the server process.
 */
const cardState = new Map<string, CardMetadata>();

export function createMockProvider(secret: string | undefined): PaymentProvider {
  return {
    name: "mock",
    simulated: true,
    async getApplicationStatus(): Promise<CardApplicationStatus> {
      return "simulated";
    },
    async getCard(userId) {
      if (!cardState.has(userId)) {
        cardState.set(userId, { cardId: `sim_${userId}`, last4: "0427", design: "green", status: "active", expiryLabel: "MM/YY", simulated: true });
      }
      return cardState.get(userId)!;
    },
    async listTransactions(_userId, limit = 20): Promise<TransactionEvent[]> {
      return ACTIVITY.slice(0, limit).map((a) => ({
        id: a.id, cardId: "sim", merchantLabel: a.merchantLabel, amount: a.amount, currency: a.currency, occurredAt: a.date,
        status: a.status === "demo-declined" ? "declined" : a.status === "demo-pending" ? "authorised" : "settled",
        simulated: true,
      }));
    },
    async setCardStatus(userId, status) {
      const card = (await this.getCard(userId))!;
      const next = { ...card, status };
      cardState.set(userId, next);
      return next;
    },
    async verifyWebhook(rawBody, signature): Promise<WebhookEnvelope | null> {
      if (!secret || !signature) return null;
      if (!verifySignature(rawBody, signature, secret)) return null;
      try {
        const parsed = JSON.parse(rawBody) as Partial<WebhookEnvelope>;
        if (!parsed.id || !parsed.type || !parsed.occurredAt) return null;
        return parsed as WebhookEnvelope;
      } catch {
        return null;
      }
    },
  };
}
