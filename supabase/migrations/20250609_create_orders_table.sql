-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product Reference
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  product_image_url TEXT,
  
  -- Order Details
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10, 2) NOT NULL,
  
  -- Customer Information
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_whatsapp TEXT,
  customer_email TEXT,
  
  -- Delivery Address
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  
  -- Additional Info
  customer_note TEXT,
  
  -- Order Status
  order_status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (
    order_status IN ('pending_payment', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')
  ),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (
    payment_status IN ('unpaid', 'paid', 'failed', 'refunded')
  ),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at_trigger
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_updated_at();

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view orders (we'll use order ID for verification)
CREATE POLICY "Anyone can view orders" ON orders
  FOR SELECT
  USING (true);

-- RLS Policy: Only authenticated users (admin) can update orders
CREATE POLICY "Only admin can update orders" ON orders
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policy: Only admin can delete orders
CREATE POLICY "Only admin can delete orders" ON orders
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- RLS Policy: Anyone can insert orders (for customer checkout)
CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT
  WITH CHECK (true);
