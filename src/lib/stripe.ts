import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const LIFETIME_PRICE = 4999; // $49.99 in cents
export const LIFETIME_PRODUCT_NAME = "ClosetIQ Lifetime Access";
