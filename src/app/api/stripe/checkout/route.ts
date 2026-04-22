import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, LIFETIME_PRICE, LIFETIME_PRODUCT_NAME } from "@/lib/stripe";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("purchase_tier")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (profile.purchase_tier === "lifetime") {
    return NextResponse.json(
      { error: "Already have lifetime access" },
      { status: 400 }
    );
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3002";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: LIFETIME_PRICE,
          product_data: {
            name: LIFETIME_PRODUCT_NAME,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/settings?payment=success`,
    cancel_url: `${origin}/settings?payment=cancelled`,
    metadata: {
      user_id: user.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
