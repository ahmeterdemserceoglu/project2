import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

    // Get the SQL file paths
    const uniqueSlugSqlPath = path.join(process.cwd(), 'sql', 'unique_slug_function.sql');
    const uniqueSkuSqlPath = path.join(process.cwd(), 'sql', 'unique_sku_function.sql');
    const adminProductFunctionsPath = path.join(process.cwd(), 'sql', 'admin_product_functions.sql');

    // Read the SQL files
    const uniqueSlugSql = fs.readFileSync(uniqueSlugSqlPath, 'utf8');
    const uniqueSkuSql = fs.readFileSync(uniqueSkuSqlPath, 'utf8');
    const adminProductFunctionsSql = fs.readFileSync(adminProductFunctionsPath, 'utf8');

    // Combine the SQL statements
    const combinedSql = uniqueSlugSql + '\n\n' + uniqueSkuSql + '\n\n' + adminProductFunctionsSql;

    // Execute the SQL statements directly
    const { error } = await supabase.rpc(
      'admin_execute_sql',
      { sql_statement: combinedSql }
    );

    if (error) {
      console.error('Error executing SQL:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to apply SQL functions', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SQL functions applied successfully'
    });
  } catch (err: any) {
    console.error('Error applying SQL functions:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: err.message },
      { status: 500 }
    );
  }
} 