import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: outfit, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !outfit) {
    return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
  }

  // Fetch garments by garment_ids
  const { data: garments, error: garmentsError } = await supabase
    .from("garments")
    .select("*")
    .in("id", outfit.garment_ids);

  if (garmentsError) {
    return NextResponse.json(
      { error: "Failed to fetch garments", details: garmentsError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ outfit: { ...outfit, garments } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id: _id, user_id: _uid, created_at: _ca, ...updates } = body;

  const { data: outfit, error } = await supabase
    .from("outfits")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !outfit) {
    return NextResponse.json(
      { error: "Failed to update outfit", details: error?.message },
      { status: 404 }
    );
  }

  return NextResponse.json({ outfit });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("outfits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete outfit", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
