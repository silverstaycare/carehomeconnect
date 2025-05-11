
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
    // Create Supabase client using the anon key for user authentication
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

    // Get request body
    const { planId, numberOfBeds, boostEnabled, successUrl, cancelUrl } = await req.json();
    
    // Determine pricing based on the plan
    let unitAmount;
    let planName;
    switch (planId) {
      case 'basic':
        unitAmount = 999; // $9.99 per bed in cents
        planName = 'Starter Plan';
        break;
      case 'pro':
        unitAmount = 1499; // $14.99 per bed in cents
        planName = 'Pro Plan';
        break;
      default:
        throw new Error("Invalid plan ID");
    }
    
    // Create line items
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${planName} (${numberOfBeds} bed${numberOfBeds > 1 ? 's' : ''})`,
          },
          unit_amount: unitAmount,
          recurring: {
            interval: 'month',
          },
        },
        quantity: numberOfBeds,
      },
    ];

    // Add boost if enabled
    if (boostEnabled) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Boost Add-on',
          },
          unit_amount: 4999, // $49.99 in cents
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      });
    }

    // Check if user already exists as a Stripe customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: 'subscription',
      success_url: successUrl || `${req.headers.get("origin")}/owner/subscription?success=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/owner/subscription?canceled=true`,
      metadata: {
        userId: user.id,
        planId: planId,
        numberOfBeds: numberOfBeds.toString(),
        boostEnabled: boostEnabled ? 'true' : 'false',
      },
    });

    // Return the checkout URL
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
