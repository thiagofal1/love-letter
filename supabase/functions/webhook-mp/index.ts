import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const encoder = new TextEncoder();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const resourceIdPattern = /^[a-z\d_-]{1,128}$/i;
const premiumPrice = 3.99;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSignature(header: string | null) {
  const fields = new Map<string, string>();
  for (const part of header?.split(",") ?? []) {
    const separator = part.indexOf("=");
    if (separator > 0) {
      fields.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
    }
  }

  const timestamp = fields.get("ts");
  const signature = fields.get("v1");
  if (!timestamp || !/^\d+$/.test(timestamp) || !signature || !/^[a-f\d]{64}$/i.test(signature)) {
    return null;
  }
  return { timestamp, signature };
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function isValidSignature(
  signatureHeader: string | null,
  requestId: string | null,
  dataId: string | null,
  secret: string,
) {
  const signature = parseSignature(signatureHeader);
  if (!signature || !requestId) return false;

  const timestamp = Number(signature.timestamp);
  if (!Number.isSafeInteger(timestamp)) return false;

  // Retries are safe because the handler fetches current resource state and processes payments idempotently.
  const manifest = `${dataId ? `id:${dataId.toLowerCase()};` : ""}request-id:${requestId};ts:${signature.timestamp};`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
  const expected = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return constantTimeEqual(expected, signature.signature.toLowerCase());
}

async function fetchMercadoPagoResource(accessToken: string, path: string) {
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Mercado Pago resource lookup failed with status ${response.status}`);
  }
  return await response.json();
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("MP_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("Missing MP_WEBHOOK_SECRET");
    return new Response("Webhook is not configured", { status: 500 });
  }

  const url = new URL(req.url);
  let payload: { type?: string; data?: { id?: string | number } } = {};
  const rawBody = await req.text();
  if (rawBody) {
    try {
      const parsedBody: unknown = JSON.parse(rawBody);
      if (!isRecord(parsedBody)) {
        return new Response("Invalid JSON payload", { status: 400 });
      }
      const eventData = isRecord(parsedBody.data) ? parsedBody.data : null;
      const eventId = eventData?.id;
      payload = {
        type: typeof parsedBody.type === "string" ? parsedBody.type : undefined,
        data:
          typeof eventId === "string" || typeof eventId === "number"
            ? { id: eventId }
            : undefined,
      };
    } catch {
      return new Response("Invalid JSON payload", { status: 400 });
    }
  }

  const signedDataId = url.searchParams.get("data.id");
  const dataId = signedDataId ?? (payload.data?.id == null ? null : String(payload.data.id));
  let validSignature = false;
  try {
    validSignature = await isValidSignature(
      req.headers.get("x-signature"),
      req.headers.get("x-request-id"),
      signedDataId,
      webhookSecret,
    );
  } catch (error) {
    console.error("Could not validate Mercado Pago webhook signature:", error);
    return new Response("Could not validate webhook", { status: 500 });
  }
  if (!validSignature) {
    return new Response("Invalid webhook signature", { status: 401 });
  }

  const type = payload.type ?? url.searchParams.get("type");
  const isPreapprovalEvent = type === "subscription_preapproval";
  const isAuthorizedPaymentEvent = type === "subscription_authorized_payment";
  if (!isPreapprovalEvent && !isAuthorizedPaymentEvent) {
    return new Response("Event ignored", { status: 200 });
  }
  if (!dataId || !resourceIdPattern.test(dataId)) {
    return new Response("Invalid resource ID", { status: 400 });
  }

  try {
    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!mpAccessToken || !supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Mercado Pago or Supabase service configuration");
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (isPreapprovalEvent) {
      const preapproval = await fetchMercadoPagoResource(
        mpAccessToken,
        `/preapproval/${encodeURIComponent(dataId)}`,
      );
      const userId = preapproval.external_reference;
      const status = preapproval.status;
      if (typeof userId !== "string" || !uuidPattern.test(userId)) {
        throw new Error("Mercado Pago preapproval has an invalid external_reference");
      }
      if (!["authorized", "paused", "cancelled", "pending", "rejected"].includes(status)) {
        throw new Error(`Unsupported Mercado Pago subscription status: ${String(status)}`);
      }

      const { data: currentSubscription, error: lookupError } = await supabaseAdmin
        .from("subscriptions")
        .select("mp_preapproval_id, payment_method, current_period_end")
        .eq("user_id", userId)
        .maybeSingle();
      if (lookupError) {
        throw new Error(`Failed to read subscription: ${lookupError.message}`);
      }
      if (currentSubscription?.mp_preapproval_id !== dataId) {
        return new Response("Outdated subscription event ignored", { status: 200 });
      }

      const { error: subscriptionError } = await supabaseAdmin
        .from("subscriptions")
        .update({
          mp_payer_email: preapproval.payer_email ?? null,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
      if (subscriptionError) {
        throw new Error(`Failed to update subscription: ${subscriptionError.message}`);
      }

      const pixAccessActive = currentSubscription.payment_method === "pix" &&
        currentSubscription.current_period_end &&
        new Date(currentSubscription.current_period_end).getTime() > Date.now();
      const premiumActive = currentSubscription.payment_method === "card"
        ? status === "authorized"
        : Boolean(pixAccessActive);
      const { error: lettersError } = await supabaseAdmin
        .from("letters")
        .update({
          is_premium: premiumActive,
          ...(premiumActive ? {} : { theme_id: "warm-gold" }),
        })
        .eq("user_id", userId);
      if (lettersError) {
        throw new Error(`Failed to update letter entitlements: ${lettersError.message}`);
      }

      return new Response("Subscription event processed", { status: 200 });
    }

    const authorizedPayment = await fetchMercadoPagoResource(
      mpAccessToken,
      `/authorized_payments/${encodeURIComponent(dataId)}`,
    );
    const preapprovalId = authorizedPayment.preapproval_id;
    if (typeof preapprovalId !== "string" || !resourceIdPattern.test(preapprovalId)) {
      throw new Error("Authorized payment has an invalid preapproval ID");
    }

    const { data: subscription, error: subscriptionLookupError } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, payment_method, mp_preapproval_id")
      .eq("mp_preapproval_id", preapprovalId)
      .maybeSingle();
    if (subscriptionLookupError) {
      throw new Error(`Failed to find subscription: ${subscriptionLookupError.message}`);
    }
    if (!subscription || subscription.payment_method !== "pix") {
      return new Response("Payment is not linked to a Pix subscription", { status: 200 });
    }

    const payment = isRecord(authorizedPayment.payment) ? authorizedPayment.payment : {};
    if (authorizedPayment.status !== "processed" || payment.status !== "approved") {
      return new Response("Payment is not approved", { status: 200 });
    }

    const amount = Number(payment.transaction_amount ?? authorizedPayment.transaction_amount);
    const currencyId = payment.currency_id ?? authorizedPayment.currency_id;
    if (amount !== premiumPrice || currencyId !== "BRL") {
      console.error("Ignoring Pix payment with unexpected amount or currency.", {
        authorizedPaymentId: dataId,
        amount,
        currencyId,
      });
      return new Response("Payment amount or currency does not match", { status: 200 });
    }

    const paymentId = payment.id == null ? null : String(payment.id);
    const paidAt = payment.date_approved ?? authorizedPayment.last_modified ?? authorizedPayment.date_created;
    if (typeof paidAt !== "string" || !Number.isFinite(Date.parse(paidAt))) {
      throw new Error("Authorized payment has no valid approval timestamp");
    }

    const { error: applyError } = await supabaseAdmin.rpc("apply_pix_subscription_payment", {
      p_authorized_payment_id: dataId,
      p_preapproval_id: preapprovalId,
      p_payment_id: paymentId,
      p_user_id: subscription.user_id,
      p_amount: amount,
      p_currency_id: currencyId,
      p_paid_at: paidAt,
    });
    if (applyError) {
      throw new Error(`Failed to apply Pix Premium period: ${applyError.message}`);
    }

    return new Response("Pix payment processed", { status: 200 });
  } catch (error) {
    console.error("Mercado Pago webhook processing failed:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
});
