import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DELETE - Remove product from collection
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const supabase = await createClient();
    const { id, productId } = await params;
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove product from collection
    const { error } = await supabase
      .from("collection_products")
      .delete()
      .eq("collection_id", id)
      .eq("product_id", productId);

    if (error) {
      return NextResponse.json({ error: "Failed to remove product" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}