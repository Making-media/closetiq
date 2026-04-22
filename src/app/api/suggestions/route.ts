import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateShoppingSuggestions } from "@/lib/claude";
import { Garment, StyleGoal } from "@/types";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check for existing active suggestions
  const { data: existing } = await supabase
    .from("suggestions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (existing && existing.length > 0) {
    return NextResponse.json({ suggestions: existing });
  }

  // Check purchase tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("purchase_tier, style_goals")
    .eq("id", user.id)
    .single();

  if (!profile || profile.purchase_tier === "free") {
    return NextResponse.json(
      { error: "Shopping suggestions require Lifetime access." },
      { status: 403 }
    );
  }

  const styleGoals: StyleGoal[] = profile.style_goals ?? [];

  // Fetch user garments
  const { data: garments, error: garmentsError } = await supabase
    .from("garments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (garmentsError) {
    return NextResponse.json(
      { error: "Failed to fetch garments", details: garmentsError.message },
      { status: 500 }
    );
  }

  if (!garments || garments.length < 3) {
    return NextResponse.json(
      { error: "At least 3 garments are required to generate shopping suggestions" },
      { status: 400 }
    );
  }

  // Generate AI shopping suggestions
  const aiSuggestions = await generateShoppingSuggestions(garments as Garment[], styleGoals);

  const savedSuggestions = [];

  for (const suggestion of aiSuggestions) {
    const { data: saved, error: insertError } = await supabase
      .from("suggestions")
      .insert({
        user_id: user.id,
        type: suggestion.type,
        garment_type: suggestion.garment_type,
        recommended_colors: suggestion.recommended_colors,
        reason: suggestion.reason,
        outfits_unlocked: suggestion.outfits_unlocked,
        affiliate_url: null,
        status: "active",
      })
      .select()
      .single();

    if (insertError || !saved) continue;

    savedSuggestions.push(saved);
  }

  return NextResponse.json({ suggestions: savedSuggestions });
}
