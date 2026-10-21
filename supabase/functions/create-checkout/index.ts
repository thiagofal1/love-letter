import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PaymentMethod = "card" | "pix";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function cancelPreapproval(accessToken: string, preapprovalId: string) {
  const response = await fetch(
    `https://api.mercadopago.com/preapproval/${encodeURIComponent(preapprovalId)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "cancelled" }),
    },
  );
  if (!response.ok) {
    throw new Error(`Could not cancel previous Mercado Pago subscription (${response.status})`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!supabaseUrl || !anonKey || !serviceRoleKey || !mpAccessToken) {
      throw new Error("Missing Supabase or Mercado Pago function configuration");
    }

    const authorization = req.headers.get("Authorization");
    const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!accessToken) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const authClient = createClient(supabaseUrl, anonKey);
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(accessToken);
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    if (!user.email) {
      return jsonResponse({ error: "A conta precisa ter um e-mail para iniciar o pagamento." }, 400);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid request body" }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({ error: "Invalid request body" }, 400);
    }
    const paymentMethod = (body as { paymentMethod?: unknown }).paymentMethod;
    if (paymentMethod !== "card" && paymentMethod !== "pix") {
      return jsonResponse({ error: "Choose card or Pix to continue." }, 400);
    }

    const appBaseUrl = new URL(Deno.env.get("APP_BASE_URL") ?? "https://love.thigasfal.dev");
    if (appBaseUrl.protocol !== "https:" || appBaseUrl.username || appBaseUrl.password) {
      throw new Error("APP_BASE_URL must be an HTTPS URL without credentials");
    }
    const backUrl = new URL("/", appBaseUrl).toString();
    const notificationUrl = new URL("/functions/v1/webhook-mp", supabaseUrl).toString();
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: currentSubscription, error: subscriptionLookupError } = await supabaseAdmin
      .from("subscriptions")
      .select("payment_method, mp_preapproval_id, status, current_period_end, checkout_url")
      .eq("user_id", user.id)
      .maybeSingle();
    if (subscriptionLookupError) {
      throw new Error(`Failed to check existing subscription: ${subscriptionLookupError.message}`);
    }

    const pixPeriodEnd = currentSubscription?.payment_method === "pix" &&
      currentSubscription.current_period_end
      ? new Date(currentSubscription.current_period_end).getTime()
      : 0;
    const hasActiveEntitlement = currentSubscription?.payment_method === "card"
      ? currentSubscription.status === "authorized"
      : pixPeriodEnd > Date.now();
    if (hasActiveEntitlement) {
      return jsonResponse({
        error: currentSubscription?.payment_method === paymentMethod
          ? "Sua conta já tem Premium ativo."
          : "Já existe outro meio de pagamento ativo nesta conta. Cancele ou aguarde o fim do período atual antes de trocar.",
      }, 409);
    }

    if (
      currentSubscription?.status === "pending" &&
      currentSubscription.payment_method === paymentMethod &&
      typeof currentSubscription.checkout_url === "string"
    ) {
      return jsonResponse({ init_point: currentSubscription.checkout_url });
    }

    if (
      currentSubscription?.mp_preapproval_id &&
      !["cancelled", "rejected"].includes(currentSubscription.status)
    ) {
      try {
        await cancelPreapproval(mpAccessToken, currentSubscription.mp_preapproval_id);
        const { error: cancelRecordError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "cancelled",
            checkout_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
        if (cancelRecordError) {
          throw new Error(`Failed to record cancellation: ${cancelRecordError.message}`);
        }
      } catch (error) {
        console.error("Could not cancel the previous inactive subscription:", error);
        return jsonResponse({
          error: "Não foi possível encerrar a cobrança anterior. Tente novamente ou contate o suporte.",
        }, 502);
      }
    }

    const preapprovalBody: Record<string, unknown> = {
      reason: "Love Letter Premium",
      external_reference: user.id,
      payer_email: user.email,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 3.99,
        currency_id: "BRL",
      },
      back_url: backUrl,
      notification_url: notificationUrl,
    };
    if (paymentMethod === "pix") {
      preapprovalBody.status = "pending";
    }

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preapprovalBody),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Mercado Pago subscription creation failed:", {
        status: response.status,
        error: data?.error,
        message: data?.message,
      });
      return jsonResponse({
        error: data?.message || data?.error || "Mercado Pago não conseguiu iniciar o pagamento.",
      }, 502);
    }
    if (typeof data.id !== "string" || typeof data.init_point !== "string") {
      console.error("Mercado Pago returned an incomplete preapproval response.");
      return jsonResponse({ error: "Mercado Pago retornou uma resposta incompleta." }, 502);
    }

    const { error: saveError } = await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: user.id,
        mp_preapproval_id: data.id,
        mp_payer_email: user.email,
        payment_method: paymentMethod,
        status: paymentMethod === "pix" ? "pending" : (data.status ?? "pending"),
        current_period_end: null,
        checkout_url: data.init_point,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (saveError) {
      try {
        await cancelPreapproval(mpAccessToken, data.id);
      } catch (cancelError) {
        console.error("Could not cancel unrecorded Mercado Pago subscription:", cancelError);
      }
      throw new Error(`Failed to save subscription: ${saveError.message}`);
    }

    return jsonResponse({ init_point: data.init_point });
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return jsonResponse({
      error: error instanceof Error ? error.message : "Não foi possível iniciar o pagamento.",
    }, 500);
  }
});
