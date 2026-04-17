import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { removeBackground, extractColors } from "@/lib/image-processing";
import { classifyGarment } from "@/lib/claude";
import { getTemplatePath, getTemplateId } from "@/lib/garment-templates";

const FREE_TIER_GARMENT_LIMIT = 20;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Free tier garment limit check
  const { data: profile } = await supabase
    .from("users")
    .select("purchase_tier")
    .eq("id", user.id)
    .single();

  if (profile?.purchase_tier === "free") {
    const { count } = await supabase
      .from("garments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (count !== null && count >= FREE_TIER_GARMENT_LIMIT) {
      return NextResponse.json(
        {
          error: "Free tier limit reached",
          message: `Free accounts are limited to ${FREE_TIER_GARMENT_LIMIT} garments. Upgrade to add more.`,
        },
        { status: 403 }
      );
    }
  }

  // Get image from FormData
  const formData = await request.formData();
  const imageFile = formData.get("image") as File | null;

  if (!imageFile) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const imageArrayBuffer = await imageFile.arrayBuffer();
  const imageBuffer = Buffer.from(imageArrayBuffer);

  // Optimize with sharp
  const optimizedBuffer = await sharp(imageBuffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Remove background
  const processedBuffer = await removeBackground(optimizedBuffer);

  // Extract colors
  const colors = await extractColors(optimizedBuffer);

  // Classify with Claude Vision (base64)
  const imageBase64 = optimizedBuffer.toString("base64");
  const classification = await classifyGarment(imageBase64);

  // Upload to Supabase Storage
  const timestamp = Date.now();
  const originalPath = `${user.id}/${timestamp}-original.jpg`;
  const processedPath = `${user.id}/${timestamp}-processed.png`;

  const { error: originalUploadError } = await supabase.storage
    .from("garments")
    .upload(originalPath, optimizedBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (originalUploadError) {
    return NextResponse.json(
      { error: "Failed to upload original image", details: originalUploadError.message },
      { status: 500 }
    );
  }

  const { error: processedUploadError } = await supabase.storage
    .from("garments")
    .upload(processedPath, processedBuffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (processedUploadError) {
    return NextResponse.json(
      { error: "Failed to upload processed image", details: processedUploadError.message },
      { status: 500 }
    );
  }

  // Get public URLs
  const { data: originalUrlData } = supabase.storage
    .from("garments")
    .getPublicUrl(originalPath);

  const { data: processedUrlData } = supabase.storage
    .from("garments")
    .getPublicUrl(processedPath);

  // Save garment to DB
  const templatePath = getTemplatePath(classification.subtype, classification.type);
  const templateId = getTemplateId(classification.subtype);

  const { data: garment, error: insertError } = await supabase
    .from("garments")
    .insert({
      user_id: user.id,
      name: classification.name,
      type: classification.type,
      subtype: classification.subtype,
      colors,
      pattern: classification.pattern,
      formality: classification.formality,
      season: classification.season,
      material: classification.material,
      image_url: originalUrlData.publicUrl,
      processed_image_url: processedUrlData.publicUrl,
      three_d_template_id: templateId,
      wear_count: 0,
      last_worn_at: null,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to save garment", details: insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ garment, template_path: templatePath });
}
