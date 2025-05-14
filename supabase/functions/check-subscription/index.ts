
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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
      // Update the subscribers table to record no subscription
      await supabaseClient.from("subscribers").upsert({
        user_id: user.id,
        subscription_id: null,
        status: 'inactive',
        beds_count: 0,
        current_period_end: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      // No subscription found
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
      // Update the subscribers table to record canceled/expired subscription
      await supabaseClient.from("subscribers").upsert({
        user_id: user.id,
        subscription_id: null,
        status: 'inactive',
        beds_count: 0,
        current_period_end: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      // No active subscription found
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const subscription = subscriptions.data[0];
    
    // Get number of beds from subscription quantity
    let numberOfBeds = 1;
    if (subscription.items.data.length > 0) {
      numberOfBeds = subscription.items.data[0].quantity || 1;
    }
    
    // Update the subscribers table with current subscription info
    await supabaseClient.from("subscribers").upsert({
      user_id: user.id,
      subscription_id: subscription.id,
      status: 'active',
      beds_count: numberOfBeds,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    
    // Return subscription details
    return new Response(JSON.stringify({
      subscribed: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end * 1000, // Convert to milliseconds
        numberOfBeds
      }
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
