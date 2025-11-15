import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch products in a collection
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // Get products in this collection
    const { data: collectionProducts, error } = await supabase
      .from("collection_products")
      .select(`
        products (
          id,
          name,
          slug,
          base_price,
          sale_price,
          primary_image_url,
          is_featured,
          created_at,
          categories (
            name
          )
        )
      `)
      .eq("collection_id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    // Format the response
    const products = collectionProducts?.map((cp: any) => ({
      id: cp.products.id,
      name: cp.products.name,
      slug: cp.products.slug,
      base_price: cp.products.base_price,
      sale_price: cp.products.sale_price,
      primary_image_url: cp.products.primary_image_url,
      is_featured: cp.products.is_featured,
      created_at: cp.products.created_at,
      category_name: cp.products.categories?.name || ""
    })) || [];

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Add product to collection
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Check if product is already in collection
    const { data: existing } = await supabase
      .from("collection_products")
      .select("id")
      .eq("collection_id", id)
      .eq("product_id", product_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Product already in collection" }, { status: 400 });
    }

    // Add product to collection
    const { error } = await supabase
      .from("collection_products")
      .insert({
        collection_id: id,
        product_id: product_id,
        added_by: user.id
      });

    if (error) {
      return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}