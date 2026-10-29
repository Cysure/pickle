import { createMockProvider } from "./mock";
import type { PaymentProvider } from "./types";

let provider: PaymentProvider | null = null;

/** Returns the configured provider. Only the mock exists today; a live adapter is wired here. */
export function getPaymentProvider(): PaymentProvider {
  if (provider) return provider;
  const kind = process.env.PAYMENT_PROVIDER?.trim() || "mock";
  if (kind !== "mock") {
    console.warn(`[payments] provider "${kind}" is not implemented; falling back to the mock provider.`);
  }
  provider = createMockProvider(process.env.PAYMENT_WEBHOOK_SECRET);
  return provider;
}
export type { PaymentProvider } from "./types";
