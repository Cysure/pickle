/**
 * Payment provider boundary. Pickle never touches card credentials; a
 * licensed issuing partner does. This interface is the only place the rest
 * of the product talks to that partner, so a live adapter can replace the
 * mock without touching UI code. Server-only.
 */
export type CardApplicationStatus = "not-started" | "submitted" | "in-review" | "approved" | "declined" | "simulated";
export type CardStatus = "inactive" | "active" | "frozen" | "cancelled";

export interface CardMetadata {
  cardId: string;
  /** last four of a masked reference; never a full PAN */
  last4: string;
  design: "green" | "black" | "reserve";
  status: CardStatus;
  expiryLabel: string; // "MM/YY" placeholder from the provider, never computed here
  simulated: boolean;
}

export interface TransactionEvent {
  id: string;
  cardId: string;
  merchantLabel: string;
  amount: number;
  currency: string;
  occurredAt: string;
  status: "authorised" | "settled" | "declined" | "reversed";
  simulated: boolean;
}

export interface WebhookEnvelope {
  id: string;
  type: "transaction.created" | "transaction.settled" | "card.status_changed" | "application.updated";
  occurredAt: string;
  data: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  readonly simulated: boolean;
  getApplicationStatus(userId: string): Promise<CardApplicationStatus>;
  getCard(userId: string): Promise<CardMetadata | null>;
  listTransactions(userId: string, limit?: number): Promise<TransactionEvent[]>;
  setCardStatus(userId: string, status: Extract<CardStatus, "active" | "frozen">): Promise<CardMetadata>;
  /** Verifies a raw webhook body + signature header; returns the parsed envelope or null. */
  verifyWebhook(rawBody: string, signature: string | null): Promise<WebhookEnvelope | null>;
}
