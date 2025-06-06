import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gvsezisxgofuchzsapks.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2c2V6aXN4Z29mdWNoenNhcGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzExNTE0MSwiZXhwIjoyMDYyNjkxMTQxfQ.NR9HI83kQ0dwv3IZ9JwY_lxf2myqyxF6VJUfzXut5Q0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // SQL statements to fix RLS policies
    const sqlStatements = [
      // Drop existing policies if they exist
      "DROP POLICY IF EXISTS product_images_admin_all ON product_images;",

      // Create admin policy for full access to product_images
      `CREATE POLICY product_images_admin_all ON product_images
       USING (EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid() AND is_admin = true
       ));`,

      // Ensure the product_images_read_all policy exists
      "DROP POLICY IF EXISTS product_images_read_all ON product_images;",

      `CREATE POLICY product_images_read_all ON product_images
       FOR SELECT USING (
         EXISTS (
           SELECT 1 FROM products
           WHERE products.id = product_images.product_id AND products.is_active = true
         )
       );`
    ];

    // Execute each SQL statement
    const results = [];
    for (const sql of sqlStatements) {
      try {
        const { data, error } = await supabase.rpc('_admin_execute_sql', { sql_query: sql });

        if (error) {
          results.push({ sql, success: false, error: error.message });
        } else {
          results.push({ sql, success: true });
        }
      } catch (err: any) {
        results.push({ sql, success: false, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'RLS policies update attempted',
      results
    });
  } catch (err: any) {
    console.error('Error updating RLS policies:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
} 