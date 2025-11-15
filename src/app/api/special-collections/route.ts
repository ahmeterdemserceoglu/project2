import { NextResponse } from "next/server";
import { createServerComponentClient } from "../../../lib/supabase";

export async function GET() {
  try {
    const supabase = await createServerComponentClient();

    // Get active collections for public view
    const { data: collections, error } = await (supabase as any)
      .from("special_collections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
    }

    return NextResponse.json(collections || []);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}