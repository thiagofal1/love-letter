import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { returnUrl } = await req.json();

    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpAccessToken) {
      throw new Error("Missing MP_ACCESS_TOKEN");
    }

    // Create a Preapproval (Subscription) plan in Mercado Pago
    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: "Love Letter Premium",
        external_reference: user.id,
        payer_email: user.email,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 3.99,
          currency_id: "BRL",
        },
        back_url: returnUrl || "https://love.thigasfal.dev",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Mercado Pago Error:", data);
      throw new Error(`Mercado Pago: ${data.message || data.error || 'Falha ao criar assinatura'}`);
    }

    // Store pending subscription in Supabase using Service Role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: user.id,
        mp_preapproval_id: data.id,
        mp_payer_email: user.email,
        status: "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return new Response(JSON.stringify({ init_point: data.init_point }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
