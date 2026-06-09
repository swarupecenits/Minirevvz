-- Add quantity field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 0;

-- Add comment to document the field
COMMENT ON COLUMN products.quantity IS 'Available stock quantity for this product';
