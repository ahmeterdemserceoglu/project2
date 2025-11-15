import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch all products for admin
export async function GET() {
    try {
        const supabase = await createClient();

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

        // Get all products with category info
        const { data: products, error } = await supabase
            .from("products")
            .select(`
        id,
        name,
        slug,
        base_price,
        sale_price,
        primary_image_url,
        is_featured,
        is_active,
        created_at,
        categories (
          name
        )
      `)
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
        }

        // Format the response
        const formattedProducts = products?.map((product: any) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            base_price: product.base_price,
            sale_price: product.sale_price,
            primary_image_url: product.primary_image_url,
            is_featured: product.is_featured,
            is_active: product.is_active,
            created_at: product.created_at,
            category_name: product.categories?.name || ""
        })) || [];

        return NextResponse.json(formattedProducts);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}