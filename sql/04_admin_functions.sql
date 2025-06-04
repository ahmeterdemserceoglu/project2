-- HDTicaret.com Admin Panel Database Functions
-- This file contains SQL functions specifically for the admin panel

-- Function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats(period TEXT DEFAULT 'week')
RETURNS JSONB AS $$
DECLARE
  start_date DATE;
  previous_start_date DATE;
  current_date DATE := CURRENT_DATE;
  result JSONB;
  total_sales DECIMAL(10, 2);
  previous_total_sales DECIMAL(10, 2);
  total_orders INTEGER;
  previous_total_orders INTEGER;
  total_customers INTEGER;
  new_customers INTEGER;
  previous_new_customers INTEGER;
  average_order DECIMAL(10, 2);
  previous_average_order DECIMAL(10, 2);
  sales_change DECIMAL(10, 2);
  orders_change DECIMAL(10, 2);
  customers_change DECIMAL(10, 2);
  average_order_change DECIMAL(10, 2);
BEGIN
  -- Set date ranges based on period
  CASE period
    WHEN 'today' THEN
      start_date := current_date;
      previous_start_date := current_date - INTERVAL '1 day';
    WHEN 'week' THEN
      start_date := current_date - INTERVAL '6 days';
      previous_start_date := current_date - INTERVAL '13 days';
    WHEN 'month' THEN
      start_date := current_date - INTERVAL '29 days';
      previous_start_date := current_date - INTERVAL '59 days';
    WHEN 'year' THEN
      start_date := current_date - INTERVAL '364 days';
      previous_start_date := current_date - INTERVAL '729 days';
    ELSE
      start_date := current_date - INTERVAL '6 days';
      previous_start_date := current_date - INTERVAL '13 days';
  END CASE;

  -- Get total sales for current period
  SELECT COALESCE(SUM(total_amount), 0) INTO total_sales
  FROM orders
  WHERE created_at >= start_date AND created_at <= current_date + INTERVAL '1 day' - INTERVAL '1 second';
  
  -- Get total sales for previous period
  SELECT COALESCE(SUM(total_amount), 0) INTO previous_total_sales
  FROM orders
  WHERE created_at >= previous_start_date AND created_at < start_date;
  
  -- Calculate sales change percentage
  IF previous_total_sales = 0 THEN
    sales_change := 100; -- If previous sales were 0, consider it a 100% increase
  ELSE
    sales_change := ((total_sales - previous_total_sales) / previous_total_sales) * 100;
  END IF;

  -- Get total orders for current period
  SELECT COUNT(*) INTO total_orders
  FROM orders
  WHERE created_at >= start_date AND created_at <= current_date + INTERVAL '1 day' - INTERVAL '1 second';
  
  -- Get total orders for previous period
  SELECT COUNT(*) INTO previous_total_orders
  FROM orders
  WHERE created_at >= previous_start_date AND created_at < start_date;
  
  -- Calculate orders change percentage
  IF previous_total_orders = 0 THEN
    orders_change := 100; -- If previous orders were 0, consider it a 100% increase
  ELSE
    orders_change := ((total_orders - previous_total_orders) / previous_total_orders) * 100;
  END IF;
    
  -- Count total customers
  SELECT COUNT(*) INTO total_customers
  FROM profiles
  WHERE NOT is_admin;
    
  -- Count new customers in current period
  SELECT COUNT(*) INTO new_customers
  FROM profiles
  WHERE created_at >= start_date AND created_at <= current_date + INTERVAL '1 day' - INTERVAL '1 second'
  AND NOT is_admin;
    
  -- Count new customers in previous period
  SELECT COUNT(*) INTO previous_new_customers
  FROM profiles
  WHERE created_at >= previous_start_date AND created_at < start_date
  AND NOT is_admin;
    
  -- Calculate customers change percentage
  IF previous_new_customers = 0 THEN
    customers_change := 100; -- If previous new customers were 0, consider it a 100% increase
  ELSE
    customers_change := ((new_customers - previous_new_customers) / previous_new_customers) * 100;
  END IF;
    
  -- Calculate average order value
  IF total_orders > 0 THEN
    average_order := total_sales / total_orders;
  ELSE
    average_order := 0;
  END IF;
    
  -- Calculate previous average order value
  IF previous_total_orders > 0 THEN
    previous_average_order := previous_total_sales / previous_total_orders;
  ELSE
    previous_average_order := 0;
  END IF;
    
  -- Calculate average order change percentage
  IF previous_average_order = 0 THEN
    average_order_change := 100; -- If previous average order was 0, consider it a 100% increase
  ELSE
    average_order_change := ((average_order - previous_average_order) / previous_average_order) * 100;
  END IF;
    
  -- Build the result JSON
  result := jsonb_build_object(
    'total_sales', total_sales,
    'sales_change', sales_change,
    'total_orders', total_orders,
    'orders_change', orders_change,
    'total_customers', total_customers,
    'new_customers', new_customers,
    'customers_change', customers_change,
    'average_order', average_order,
    'average_order_change', average_order_change,
    'period', period,
    'start_date', start_date,
    'end_date', current_date
  );
    
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent orders for admin dashboard
CREATE OR REPLACE FUNCTION get_admin_recent_orders(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  id UUID,
  order_number TEXT,
  customer_name TEXT,
  status TEXT,
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    CONCAT(p.first_name, ' ', p.last_name) as customer_name,
    o.status,
    o.total_amount,
    o.created_at
  FROM orders o
  JOIN profiles p ON o.user_id = p.id
  ORDER BY o.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top selling products
CREATE OR REPLACE FUNCTION get_admin_top_products(
  period TEXT DEFAULT 'week',
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category_name TEXT,
  units_sold BIGINT,
  total_revenue DECIMAL(10, 2),
  average_price DECIMAL(10, 2),
  stock_quantity INTEGER
) AS $$
DECLARE
  start_date DATE;
  current_date DATE := CURRENT_DATE;
BEGIN
  -- Set date range based on period
  CASE period
    WHEN 'today' THEN
      start_date := current_date;
    WHEN 'week' THEN
      start_date := current_date - INTERVAL '6 days';
    WHEN 'month' THEN
      start_date := current_date - INTERVAL '29 days';
    WHEN 'year' THEN
      start_date := current_date - INTERVAL '364 days';
    ELSE
      start_date := current_date - INTERVAL '6 days';
  END CASE;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    c.name AS category_name,
    SUM(oi.quantity) AS units_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue,
    AVG(oi.unit_price) AS average_price,
    p.stock_quantity
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  JOIN products p ON oi.product_id = p.id
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE o.created_at >= start_date
    AND o.created_at <= current_date + INTERVAL '1 day' - INTERVAL '1 second'
    AND o.status != 'cancelled'
  GROUP BY p.id, p.name, c.name, p.stock_quantity
  ORDER BY units_sold DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get sales by time period
CREATE OR REPLACE FUNCTION get_admin_sales_by_period(
  period TEXT DEFAULT 'day',
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  date_label TEXT,
  total_sales DECIMAL(10, 2),
  order_count BIGINT
) AS $$
BEGIN
  IF period = 'day' THEN
    RETURN QUERY
    SELECT 
      TO_CHAR(DATE_TRUNC('day', o.created_at), 'YYYY-MM-DD') AS date_label,
      SUM(o.total_amount) AS total_sales,
      COUNT(*) AS order_count
    FROM orders o
    WHERE o.created_at >= start_date
      AND o.created_at <= end_date + INTERVAL '1 day' - INTERVAL '1 second'
      AND o.status != 'cancelled'
    GROUP BY DATE_TRUNC('day', o.created_at)
    ORDER BY DATE_TRUNC('day', o.created_at);
  
  ELSIF period = 'week' THEN
    RETURN QUERY
    SELECT 
      TO_CHAR(DATE_TRUNC('week', o.created_at), 'YYYY-MM-DD') AS date_label,
      SUM(o.total_amount) AS total_sales,
      COUNT(*) AS order_count
    FROM orders o
    WHERE o.created_at >= start_date
      AND o.created_at <= end_date + INTERVAL '1 day' - INTERVAL '1 second'
      AND o.status != 'cancelled'
    GROUP BY DATE_TRUNC('week', o.created_at)
    ORDER BY DATE_TRUNC('week', o.created_at);
  
  ELSIF period = 'month' THEN
    RETURN QUERY
    SELECT 
      TO_CHAR(DATE_TRUNC('month', o.created_at), 'YYYY-MM') AS date_label,
      SUM(o.total_amount) AS total_sales,
      COUNT(*) AS order_count
    FROM orders o
    WHERE o.created_at >= start_date
      AND o.created_at <= end_date + INTERVAL '1 day' - INTERVAL '1 second'
      AND o.status != 'cancelled'
    GROUP BY DATE_TRUNC('month', o.created_at)
    ORDER BY DATE_TRUNC('month', o.created_at);
  
  ELSE -- Default to day
    RETURN QUERY
    SELECT 
      TO_CHAR(DATE_TRUNC('day', o.created_at), 'YYYY-MM-DD') AS date_label,
      SUM(o.total_amount) AS total_sales,
      COUNT(*) AS order_count
    FROM orders o
    WHERE o.created_at >= start_date
      AND o.created_at <= end_date + INTERVAL '1 day' - INTERVAL '1 second'
      AND o.status != 'cancelled'
    GROUP BY DATE_TRUNC('day', o.created_at)
    ORDER BY DATE_TRUNC('day', o.created_at);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get sales by category
CREATE OR REPLACE FUNCTION get_admin_sales_by_category(
  period TEXT DEFAULT 'month'
)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  total_sales DECIMAL(10, 2),
  percentage DECIMAL(5, 2)
) AS $$
DECLARE
  start_date DATE;
  current_date DATE := CURRENT_DATE;
  total DECIMAL(10, 2);
BEGIN
  -- Set date range based on period
  CASE period
    WHEN 'today' THEN
      start_date := current_date;
    WHEN 'week' THEN
      start_date := current_date - INTERVAL '6 days';
    WHEN 'month' THEN
      start_date := current_date - INTERVAL '29 days';
    WHEN 'year' THEN
      start_date := current_date - INTERVAL '364 days';
    ELSE
      start_date := current_date - INTERVAL '29 days';
  END CASE;

  -- Calculate total sales for the period
  SELECT COALESCE(SUM(o.total_amount), 0) INTO total
  FROM orders o
  WHERE o.created_at >= start_date
    AND o.created_at <= current_date + INTERVAL '1 day' - INTERVAL '1 second'
    AND o.status != 'cancelled';

  RETURN QUERY
  SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_sales,
    CASE 
      WHEN total > 0 THEN ROUND((COALESCE(SUM(oi.quantity * oi.unit_price), 0) / total) * 100, 2)
      ELSE 0
    END AS percentage
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id
  LEFT JOIN order_items oi ON p.id = oi.product_id
  LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= start_date
    AND o.created_at <= current_date + INTERVAL '1 day' - INTERVAL '1 second'
    AND o.status != 'cancelled'
  WHERE c.is_active = true
  GROUP BY c.id, c.name
  ORDER BY total_sales DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get customer statistics
CREATE OR REPLACE FUNCTION get_admin_customer_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  total_customers INTEGER;
  active_customers INTEGER;
  inactive_customers INTEGER;
  customers_with_orders INTEGER;
  customers_without_orders INTEGER;
  avg_lifetime_value DECIMAL(10, 2);
BEGIN
  -- Count total customers
  SELECT COUNT(*) INTO total_customers
  FROM profiles
  WHERE NOT is_admin;
  
  -- Count active customers (with at least one order)
  SELECT COUNT(DISTINCT user_id) INTO active_customers
  FROM orders;
  
  -- Calculate inactive customers
  inactive_customers := total_customers - active_customers;
  
  -- Count customers with orders
  customers_with_orders := active_customers;
  
  -- Count customers without orders
  customers_without_orders := inactive_customers;
  
  -- Calculate average customer lifetime value
  SELECT COALESCE(AVG(total_spent), 0) INTO avg_lifetime_value
  FROM (
    SELECT user_id, SUM(total_amount) AS total_spent
    FROM orders
    WHERE status != 'cancelled'
    GROUP BY user_id
  ) AS customer_totals;
  
  -- Build the result JSON
  result := jsonb_build_object(
    'total_customers', total_customers,
    'active_customers', active_customers,
    'inactive_customers', inactive_customers,
    'customers_with_orders', customers_with_orders,
    'customers_without_orders', customers_without_orders,
    'avg_lifetime_value', avg_lifetime_value
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get low stock products
CREATE OR REPLACE FUNCTION get_admin_low_stock_products(threshold INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  sku TEXT,
  stock_quantity INTEGER,
  category_name TEXT,
  base_price DECIMAL(10, 2),
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.sku,
    p.stock_quantity,
    c.name AS category_name,
    p.base_price,
    CASE
      WHEN p.stock_quantity = 0 THEN 'out_of_stock'
      WHEN p.stock_quantity <= threshold THEN 'low_stock'
      ELSE 'in_stock'
    END AS status
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.is_active = true
  AND p.stock_quantity <= threshold
  ORDER BY p.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a sequence for bulk operation IDs
CREATE SEQUENCE IF NOT EXISTS bulk_operation_seq;

-- Function to bulk update product prices
CREATE OR REPLACE FUNCTION admin_bulk_update_product_prices(
  category_id UUID,
  adjustment_type TEXT,
  adjustment_value DECIMAL(10, 2)
)
RETURNS JSONB AS $$
DECLARE
  affected_rows INTEGER;
  operation_id INTEGER;
BEGIN
  -- Generate operation ID
  SELECT nextval('bulk_operation_seq') INTO operation_id;
  
  -- Record the operation
  INSERT INTO admin_operations (
    operation_id,
    operation_type,
    parameters,
    created_by,
    created_at
  ) VALUES (
    operation_id,
    'bulk_price_update',
    jsonb_build_object(
      'category_id', category_id,
      'adjustment_type', adjustment_type,
      'adjustment_value', adjustment_value
    ),
    auth.uid(),
    NOW()
  );
  
  -- Perform the update based on adjustment type
  IF adjustment_type = 'percentage_increase' THEN
    UPDATE products 
    SET 
      base_price = base_price * (1 + adjustment_value / 100),
      sale_price = 
        CASE 
          WHEN sale_price IS NOT NULL THEN sale_price * (1 + adjustment_value / 100)
          ELSE NULL
        END,
      updated_at = NOW()
    WHERE
      category_id = admin_bulk_update_product_prices.category_id
      OR category_id IN (
        SELECT id FROM categories WHERE parent_id = admin_bulk_update_product_prices.category_id
      );
      
  ELSIF adjustment_type = 'percentage_decrease' THEN
    UPDATE products 
    SET 
      base_price = base_price * (1 - adjustment_value / 100),
      sale_price = 
        CASE 
          WHEN sale_price IS NOT NULL THEN sale_price * (1 - adjustment_value / 100)
          ELSE NULL
        END,
      updated_at = NOW()
    WHERE
      category_id = admin_bulk_update_product_prices.category_id
      OR category_id IN (
        SELECT id FROM categories WHERE parent_id = admin_bulk_update_product_prices.category_id
      );
      
  ELSIF adjustment_type = 'fixed_increase' THEN
    UPDATE products 
    SET 
      base_price = base_price + adjustment_value,
      sale_price = 
        CASE 
          WHEN sale_price IS NOT NULL THEN sale_price + adjustment_value
          ELSE NULL
        END,
      updated_at = NOW()
    WHERE
      category_id = admin_bulk_update_product_prices.category_id
      OR category_id IN (
        SELECT id FROM categories WHERE parent_id = admin_bulk_update_product_prices.category_id
      );
      
  ELSIF adjustment_type = 'fixed_decrease' THEN
    UPDATE products 
    SET 
      base_price = GREATEST(base_price - adjustment_value, 0),
      sale_price = 
        CASE 
          WHEN sale_price IS NOT NULL THEN GREATEST(sale_price - adjustment_value, 0)
          ELSE NULL
        END,
      updated_at = NOW()
    WHERE
      category_id = admin_bulk_update_product_prices.category_id
      OR category_id IN (
        SELECT id FROM categories WHERE parent_id = admin_bulk_update_product_prices.category_id
      );
      
  ELSIF adjustment_type = 'set_discount_percentage' THEN
    UPDATE products 
    SET 
      sale_price = ROUND(base_price * (1 - adjustment_value / 100), 2),
      updated_at = NOW()
    WHERE
      category_id = admin_bulk_update_product_prices.category_id
      OR category_id IN (
        SELECT id FROM categories WHERE parent_id = admin_bulk_update_product_prices.category_id
      );
      
  END IF;
  
  -- Get number of affected rows
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Return the result
  RETURN jsonb_build_object(
    'operation_id', operation_id,
    'affected_rows', affected_rows,
    'status', 'success'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Table to track admin operations
CREATE TABLE IF NOT EXISTS admin_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id INTEGER NOT NULL,
  operation_type TEXT NOT NULL,
  parameters JSONB,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
); 