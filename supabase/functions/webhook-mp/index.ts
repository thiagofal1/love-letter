import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("data.id") || req.body?.data?.id; // Depending on MP webhook format

    // Parse body if it exists
    let bodyText = "";
    try {
      bodyText = await req.text();
    } catch (e) {
      // Ignore
    }

    let payload = {};
    if (bodyText) {
      try {
        payload = JSON.parse(bodyText);
      } catch (e) {
        // Ignore
      }
    }

    const type = payload.type || url.searchParams.get("type");
    const id = payload.data?.id || url.searchParams.get("data.id");

    if (type !== "subscription_preapproval") {
        return new Response("Not a subscription event", { status: 200 });
    }

    if (!id) {
        return new Response("Missing ID", { status: 400 });
    }


    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!mpAccessToken) {
      throw new Error("Missing MP_ACCESS_TOKEN");
    }

    // Fetch subscription details from Mercado Pago
    const response = await fetch(`https://api.mercadopago.com/preapproval/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${mpAccessToken}`,
      },
    });

    const preapproval = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to fetch preapproval from MP: ${JSON.stringify(preapproval)}`);
    }

    const userId = preapproval.external_reference;
    const status = preapproval.status; // 'authorized', 'paused', 'cancelled', 'pending'

    if (!userId) {
        throw new Error("Missing external_reference (user_id)");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update subscription status
    await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: userId,
        mp_preapproval_id: id,
        status: status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    // If authorized, mark all user letters as premium and update user metadata
    if (status === "authorized") {
       await supabaseAdmin
        .from("letters")
        .update({ is_premium: true })
        .eq("user_id", userId);

       // Optional: Update user auth metadata
       await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { is_premium: true }
       });
    } else {
        // If cancelled or paused, revert premium status
        await supabaseAdmin
        .from("letters")
        .update({ is_premium: false })
        .eq("user_id", userId);
        
        await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { is_premium: false }
       });
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
