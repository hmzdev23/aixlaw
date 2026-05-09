/**
 * Stripe test-mode client for the demo invoice. Server-only.
 *
 * Per docs/tasks/09 §Stripe + DEMO_FIXTURES §7:
 *   - Test mode keys only.
 *   - Currency: "cad" (literal).
 *   - Demo headline: ~$90,000 CAD first-year invoice (Year 1 of 2-year term).
 *   - collection_method: "send_invoice".
 *   - Idempotency keys per `${dealId}:${chosenMoveId}` to make replays safe.
 *
 * Errors from Stripe must NOT block the demo timeline. The execution engine
 * downgrades to a `status: "error"` event and continues — see engine.ts.
 */

import Stripe from "stripe";
import type { Decision } from "@/lib/contracts";
import { logger } from "@/lib/util/logger";

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2025-02-24.acacia";

let cached: Stripe | undefined;

function getStripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached = new Stripe(key, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
    appInfo: { name: "Gambit", version: "0.1.0" },
  });
  return cached;
}

export interface StripeInvoiceResult {
  ok: boolean;
  customerId?: string;
  invoiceId?: string;
  hostedUrl?: string;
  amountCad?: number;
  detail: string;
}

const INITECH_LEGAL_NAME = "Initech Financial Group Inc." as const;

/**
 * Create a Stripe customer + invoice for the year-one chunk of the demo deal.
 *
 * Returns a typed result; never throws. The execution engine wraps the
 * outcome into a TimelineEvent.
 */
export async function createDemoInvoice(
  decision: Decision,
): Promise<StripeInvoiceResult> {
  const stripe = getStripe();
  if (!stripe) {
    return {
      ok: false,
      detail: "STRIPE_SECRET_KEY not configured — recorded narrative only.",
    };
  }

  const idempotencyKey = `gambit:${decision.dealId}:${decision.chosenMoveId}`;
  const f = decision.financials;
  // Year 1 chunk: 12 months of monthlyAmount (in cents). Aligns with the
  // demo narrative ($7,500/mo × 12 ≈ $90K CAD).
  const yearOneCents = Math.round(f.monthlyAmount * 12 * 100);
  const totalCadCents = Math.round(
    (f.totalContractCad ??
      f.monthlyAmount * Math.max(f.months, 1)) * 100,
  );

  try {
    const customer = await stripe.customers.create(
      {
        name: INITECH_LEGAL_NAME,
        description: `Gambit demo customer for deal ${decision.dealId}`,
        metadata: {
          dealId: decision.dealId,
          chosenMoveId: decision.chosenMoveId,
          gambit: "1",
        },
      },
      { idempotencyKey: `${idempotencyKey}:customer` },
    );

    // Create the invoice first (in draft state) so we can attach line items.
    const invoice = await stripe.invoices.create(
      {
        customer: customer.id,
        collection_method: "send_invoice",
        days_until_due: f.netDays,
        currency: f.currency.toLowerCase(),
        description: `Gambit — Dunder AI / Initech ${f.tier} year-one`,
        metadata: {
          dealId: decision.dealId,
          tier: f.tier,
          seats: String(f.seats),
          totalCadCents: String(totalCadCents),
        },
      },
      { idempotencyKey: `${idempotencyKey}:invoice` },
    );

    // Attach a single line item for year-one (matches the demo Stripe screen
    // shot: one obvious large line item the judges can read).
    await stripe.invoiceItems.create(
      {
        customer: customer.id,
        invoice: invoice.id,
        unit_amount: yearOneCents,
        quantity: 1,
        currency: f.currency.toLowerCase(),
        description: `Year 1 — ${f.tier} platform access (${f.seats} seats)`,
      },
      { idempotencyKey: `${idempotencyKey}:item` },
    );

    // Finalize so it appears in Stripe Dashboard as a real invoice.
    if (!invoice.id) {
      throw new Error("invoice id missing after create");
    }
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id, {
      idempotencyKey: `${idempotencyKey}:finalize`,
    });

    return {
      ok: true,
      customerId: customer.id,
      invoiceId: finalized.id,
      hostedUrl: finalized.hosted_invoice_url ?? undefined,
      amountCad: yearOneCents / 100,
      detail: `Invoice finalized for ${INITECH_LEGAL_NAME}.`,
    };
  } catch (err) {
    const e = err as Stripe.errors.StripeError;
    logger.warn("stripe invoice failed", {
      type: e.type,
      message: e.message,
      idempotencyKey,
    });
    return {
      ok: false,
      detail: `Stripe error: ${e.message}`,
    };
  }
}
