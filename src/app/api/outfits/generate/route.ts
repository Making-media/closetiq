import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOutfitSuggestions, generateOutfitRating } from "@/lib/claude";
import { scoreColorHarmony } from "@/lib/color-theory";
import { scoreStyleMatch, scoreProportionAlignment } from "@/lib/style-rules";
import { Garment, StyleGoal } from "@/types";

const FREE_TIER_AI_SUGGESTION_LIMIT = 3;

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check free tier limit
  const { data: profile } = await supabase
    .from("users")
    .select("purchase_tier, style_goals")
    .eq("id", user.id)
    .single();

  if (profile?.purchase_tier === "free") {
    const { count } = await supabase
      .from("outfits")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("source", "ai_suggested");

    if (count !== null && count >= FREE_TIER_AI_SUGGESTION_LIMIT) {
      return NextResponse.json(
        {
          error: "Free tier limit reached",
          message: `Free accounts are limited to ${FREE_TIER_AI_SUGGESTION_LIMIT} AI suggestions. Upgrade to generate more.`,
        },
        { status: 403 }
      );
    }
  }

  const styleGoals: StyleGoal[] = profile?.style_goals ?? [];

  // Fetch all user garments
  const { data: garments, error: garmentsError } = await supabase
    .from("garments")
    .select("*")
    .eq("user_id", user.id);

  if (garmentsError) {
    return NextResponse.json(
      { error: "Failed to fetch garments", details: garmentsError.message },
      { status: 500 }
    );
  }

  if (!garments || garments.length < 2) {
    return NextResponse.json(
      { error: "At least 2 garments are required to generate outfits" },
      { status: 400 }
    );
  }

  // Generate AI outfit suggestions
  const suggestions = await generateOutfitSuggestions(garments as Garment[], styleGoals, 5);

  const savedOutfits = [];

  for (const suggestion of suggestions) {
    const outfitGarments = suggestion.garment_ids_indices
      .map((i) => garments[i])
      .filter(Boolean) as Garment[];

    if (outfitGarments.length < 2) continue;

    // Deterministic scores
    const colorHarmonyScore = scoreColorHarmony(outfitGarments.map((g) => g.colors));
    const styleMatchScore = scoreStyleMatch(
      outfitGarments.map((g) => ({
        type: g.type,
        pattern: g.pattern,
        formality: g.formality,
        season: g.season,
      }))
    );
    const proportionScore = scoreProportionAlignment(
      outfitGarments.map((g) => ({
        type: g.type,
        pattern: g.pattern,
        formality: g.formality,
        season: g.season,
      })),
      styleGoals
    );

    // AI rating
    const aiRating = await generateOutfitRating(outfitGarments, styleGoals);

    // Blend deterministic + AI scores (average)
    const blendedColorHarmony =
      Math.round(((colorHarmonyScore + aiRating.color_harmony_score) / 2) * 10) / 10;
    const blendedStyleMatch =
      Math.round(((styleMatchScore + aiRating.style_match_score) / 2) * 10) / 10;
    const blendedProportion =
      Math.round(((proportionScore + aiRating.proportion_score) / 2) * 10) / 10;
    const blendedScore = Math.round(((blendedColorHarmony + blendedStyleMatch + blendedProportion) / 3) * 10) / 10;

    const { data: outfit, error: insertError } = await supabase
      .from("outfits")
      .insert({
        user_id: user.id,
        name: suggestion.name,
        garment_ids: outfitGarments.map((g) => g.id),
        source: "ai_suggested",
        ai_score: blendedScore,
        ai_comment: aiRating.comment,
        color_harmony_score: blendedColorHarmony,
        style_match_score: blendedStyleMatch,
        proportion_score: blendedProportion,
        occasion_tags: suggestion.occasion_tags,
        favorited: false,
      })
      .select()
      .single();

    if (insertError || !outfit) continue;

    savedOutfits.push({ ...outfit, garments: outfitGarments });
  }

  return NextResponse.json({ outfits: savedOutfits });
}
