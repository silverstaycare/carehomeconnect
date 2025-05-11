
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // Authenticate the user based on the token
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData.user) {
      throw new Error("Invalid token or user not found");
    }

    const user = userData.user;
    
    // Check if user exists as a Stripe customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });
    
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({
        subscribed: false,
        subscription: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    
    // Get active subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return new Response(JSON.stringify({
        subscribed: false,
        subscription: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    
    // Determine the plan ID based on the price
    const items = subscription.items.data;
    let planId = '';
    let hasBoost = false;
    let numberOfBeds = 1;
    
    // Loop through subscription items to find plan and boost
    for (const item of items) {
      const price = await stripe.prices.retrieve(item.price.id);
      const productName = price.nickname?.toLowerCase() || '';
      
      if (productName.includes('starter')) {
        planId = 'basic';
        numberOfBeds = item.quantity || 1;
      } else if (productName.includes('pro')) {
        planId = 'pro';
        numberOfBeds = item.quantity || 1;
      } else if (productName.includes('boost')) {
        hasBoost = true;
      }
    }
    
    // If we couldn't determine the plan from price nickname, use a fallback
    if (!planId) {
      // Check the subscription metadata
      if (subscription.metadata.planId) {
        planId = subscription.metadata.planId;
      } else {
        // Fallback based on price amount
        const basePrice = items[0].price.unit_amount || 0;
        if (basePrice <= 999) {
          planId = 'basic';
        } else {
          planId = 'pro';
        }
      }
      
      if (subscription.metadata.numberOfBeds) {
        numberOfBeds = parseInt(subscription.metadata.numberOfBeds, 10) || 1;
      }
      
      if (subscription.metadata.boostEnabled === 'true') {
        hasBoost = true;
      }
    }
    
    const subscriptionData = {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      planId: planId,
      hasBoost: hasBoost,
      numberOfBeds: numberOfBeds
    };

    return new Response(JSON.stringify({
      subscribed: true,
      subscription: subscriptionData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
