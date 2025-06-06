# Fixing Product Slug and SKU Uniqueness

This guide provides instructions on how to fix the uniqueness constraint violations in your e-commerce application:
- `"duplicate key value violates unique constraint "products_slug_key""`
- `"duplicate key value violates unique constraint "products_sku_key""`

## The Problem

The application is encountering database constraint violations when trying to create or update products with non-unique slugs or SKUs. This happens because:

1. The `products` table has unique constraints on both the `slug` and `sku` columns
2. The current generation logic doesn't guarantee uniqueness
3. The retry mechanism isn't handling all possible cases

## The Solution

We've created a robust solution using SQL functions to guarantee uniqueness at the database level:

1. A `generate_unique_product_slug` function that incrementally tries different slugs until it finds a unique one
2. A `generate_unique_product_sku` function that does the same for product SKUs
3. An `admin_create_product` function for creating products with guaranteed unique values
4. An `admin_update_product` function for updating products with guaranteed unique values

## How to Apply the Fix

### Option 1: Using the Supabase SQL Editor (Recommended)

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of these files in order:
   - `sql/unique_slug_function.sql`
   - `sql/unique_sku_function.sql`
   - `sql/admin_product_functions.sql`
4. Execute the SQL statements

### Option 2: Using the API Endpoint

1. Add an `ADMIN_API_KEY` to your `.env` file with a secure value:
   ```
   ADMIN_API_KEY=your_secure_key_here
   ```
2. Start your development server:
   ```
   npm run dev
   ```
3. Make a GET request to the API endpoint:
   ```
   curl -X GET http://localhost:3000/api/admin/apply-sql-functions \
     -H "Authorization: Bearer your_secure_key_here"
   ```

## Verifying the Fix

After applying the SQL functions, the application should now:

1. Generate unique slugs and SKUs automatically when creating or updating products
2. Never encounter the `products_slug_key` or `products_sku_key` constraint violations
3. Maintain consistent slug and SKU formatting

## Additional Notes

- Both uniqueness functions try incrementally numbered values (e.g., `product-1`, `sku-1`) before falling back to a timestamp-based approach.
- The SKU function handles NULL values (SKUs are optional, slugs are required).
- All functions include security checks to ensure only admin users can call them.
- The functions are defined with `SECURITY DEFINER` to bypass RLS policies and ensure they work correctly.

If you encounter any issues, check the server logs for specific error messages or contact your development team. 