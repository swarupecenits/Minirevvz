-- ============================================================
-- ATOMIC ORDER CREATION WITH STOCK DEDUCTION
-- Run this SQL in your Supabase SQL Editor
-- This prevents race conditions when two users buy simultaneously
-- ============================================================

-- First, ensure the orders table has all required columns
-- (run this only if you need to add missing columns)

-- Create the RPC function for atomic order + stock deduction
CREATE OR REPLACE FUNCTION create_order_and_deduct_stock(
  p_product_id UUID,
  p_quantity INTEGER,
  p_total_price NUMERIC,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_whatsapp TEXT DEFAULT NULL,
  p_customer_email TEXT DEFAULT NULL,
  p_address TEXT,
  p_city TEXT,
  p_state TEXT,
  p_pincode TEXT,
  p_landmark TEXT DEFAULT NULL,
  p_product_name TEXT DEFAULT NULL,
  p_product_price NUMERIC DEFAULT NULL,
  p_product_image_url TEXT DEFAULT NULL,
  p_customer_note TEXT DEFAULT NULL,
  p_order_status TEXT DEFAULT 'pending_payment',
  p_payment_status TEXT DEFAULT 'unpaid'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_quantity INTEGER;
  v_new_quantity INTEGER;
  v_order_id UUID;
  v_order JSONB;
BEGIN
  -- Lock the product row to prevent concurrent deductions
  SELECT quantity INTO v_current_quantity
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  -- Check if product exists
  IF v_current_quantity IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', jsonb_build_object('message', 'Product not found', 'code', 'PRODUCT_NOT_FOUND')
    );
  END IF;

  -- Check stock availability
  IF v_current_quantity < p_quantity THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', jsonb_build_object(
        'message', 'Insufficient stock',
        'details', format('Only %s items available, but %s were requested', v_current_quantity, p_quantity),
        'code', 'INSUFFICIENT_STOCK'
      )
    );
  END IF;

  -- Calculate new quantity
  v_new_quantity := v_current_quantity - p_quantity;

  -- Update product stock atomically
  UPDATE products
  SET quantity = v_new_quantity
  WHERE id = p_product_id;

  -- Create the order
  INSERT INTO orders (
    product_id,
    quantity,
    total_price,
    customer_name,
    customer_phone,
    customer_whatsapp,
    customer_email,
    address,
    city,
    state,
    pincode,
    landmark,
    product_name,
    product_price,
    product_image_url,
    customer_note,
    order_status,
    payment_status,
    created_at,
    updated_at
  ) VALUES (
    p_product_id,
    p_quantity,
    p_total_price,
    p_customer_name,
    p_customer_phone,
    p_customer_whatsapp,
    p_customer_email,
    p_address,
    p_city,
    p_state,
    p_pincode,
    p_landmark,
    p_product_name,
    p_product_price,
    p_product_image_url,
    p_customer_note,
    p_order_status,
    p_payment_status,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_order_id;

  -- Return the created order data
  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'id', v_order_id,
      'product_id', p_product_id,
      'quantity', p_quantity,
      'total_price', p_total_price,
      'customer_name', p_customer_name,
      'customer_phone', p_customer_phone,
      'customer_whatsapp', p_customer_whatsapp,
      'customer_email', p_customer_email,
      'address', p_address,
      'city', p_city,
      'state', p_state,
      'pincode', p_pincode,
      'landmark', p_landmark,
      'product_name', p_product_name,
      'product_price', p_product_price,
      'product_image_url', p_product_image_url,
      'customer_note', p_customer_note,
      'order_status', p_order_status,
      'payment_status', p_payment_status,
      'created_at', NOW(),
      'updated_at', NOW()
    )
  );
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION create_order_and_deduct_stock TO anon, authenticated, service_role;