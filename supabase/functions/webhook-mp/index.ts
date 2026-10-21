import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const encoder = new TextEncoder();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const resourceIdPattern = /^[a-z\d_-]{1,128}$/i;

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

  // Mercado Pago retries failed deliveries later; the handler always fetches the current resource state.
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
  if (type !== "subscription_preapproval") {
    return new Response("Event ignored", { status: 200 });
  }

  if (!dataId || !resourceIdPattern.test(dataId)) {
    return new Response("Invalid subscription ID", { status: 400 });
  }

  try {
    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!mpAccessToken || !supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Mercado Pago or Supabase service configuration");
    }

    const response = await fetch(
      `https://api.mercadopago.com/preapproval/${encodeURIComponent(dataId)}`,
      { headers: { Authorization: `Bearer ${mpAccessToken}` } },
    );
    if (!response.ok) {
      throw new Error(`Mercado Pago preapproval lookup failed with status ${response.status}`);
    }

    const preapproval = await response.json();
    const userId = preapproval.external_reference;
    const status = preapproval.status;
    if (typeof userId !== "string" || !uuidPattern.test(userId)) {
      throw new Error("Mercado Pago preapproval has an invalid external_reference");
    }
    if (!["authorized", "paused", "cancelled", "pending", "rejected"].includes(status)) {
      throw new Error(`Unsupported Mercado Pago subscription status: ${String(status)}`);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: currentSubscription, error: lookupError } = await supabaseAdmin
      .from("subscriptions")
      .select("mp_preapproval_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (lookupError) {
      throw new Error(`Failed to read subscription: ${lookupError.message}`);
    }
    if (
      currentSubscription?.mp_preapproval_id &&
      currentSubscription.mp_preapproval_id !== dataId
    ) {
      return new Response("Outdated subscription event ignored", { status: 200 });
    }

    const { error: subscriptionError } = await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: userId,
        mp_preapproval_id: dataId,
        mp_payer_email: preapproval.payer_email ?? null,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (subscriptionError) {
      throw new Error(`Failed to update subscription: ${subscriptionError.message}`);
    }

    const { error: lettersError } = await supabaseAdmin
      .from("letters")
      .update({
        is_premium: status === "authorized",
        ...(status === "authorized" ? {} : { theme_id: "warm-gold" }),
      })
      .eq("user_id", userId);
    if (lettersError) {
      throw new Error(`Failed to update letter entitlements: ${lettersError.message}`);
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Mercado Pago webhook processing failed:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
});
