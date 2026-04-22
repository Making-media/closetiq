import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOutfitRating } from "@/lib/claude";
import { scoreColorHarmony } from "@/lib/color-theory";
import { scoreStyleMatch, scoreProportionAlignment } from "@/lib/style-rules";
import { Garment, StyleGoal } from "@/types";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { garment_ids } = body as { garment_ids: string[] };

  if (!garment_ids || garment_ids.length < 2) {
    return NextResponse.json(
      { error: "At least 2 garment IDs are required" },
      { status: 400 }
    );
  }

  // Fetch user's garments matching those ids
  const { data: garments, error: garmentsError } = await supabase
    .from("garments")
    .select("*")
    .eq("user_id", user.id)
    .in("id", garment_ids);

  if (garmentsError) {
    return NextResponse.json(
      { error: "Failed to fetch garments", details: garmentsError.message },
      { status: 500 }
    );
  }

  if (!garments || garments.length < 2) {
    return NextResponse.json(
      { error: "At least 2 valid garments are required" },
      { status: 400 }
    );
  }

  const outfitGarments = garments as Garment[];

  // Get user style goals
  const { data: profile } = await supabase
    .from("users")
    .select("style_goals")
    .eq("id", user.id)
    .single();

  const styleGoals: StyleGoal[] = profile?.style_goals ?? [];

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

  // Blend scores
  const blendedColorHarmony =
    Math.round(((colorHarmonyScore + aiRating.color_harmony_score) / 2) * 10) / 10;
  const blendedStyleMatch =
    Math.round(((styleMatchScore + aiRating.style_match_score) / 2) * 10) / 10;
  const blendedProportion =
    Math.round(((proportionScore + aiRating.proportion_score) / 2) * 10) / 10;
  const blendedScore =
    Math.round(((blendedColorHarmony + blendedStyleMatch + blendedProportion) / 3) * 10) / 10;

  // Save outfit
  const { data: outfit, error: insertError } = await supabase
    .from("outfits")
    .insert({
      user_id: user.id,
      name: `My Outfit`,
      garment_ids: outfitGarments.map((g) => g.id),
      source: "user_created",
      ai_score: blendedScore,
      ai_comment: aiRating.comment,
      color_harmony_score: blendedColorHarmony,
      style_match_score: blendedStyleMatch,
      proportion_score: blendedProportion,
      occasion_tags: [],
      favorited: false,
    })
    .select()
    .single();

  if (insertError || !outfit) {
    return NextResponse.json(
      { error: "Failed to save outfit", details: insertError?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ outfit: { ...outfit, garments: outfitGarments } });
}
