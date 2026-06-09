-- Migration: Remove CASCADE delete on orders.product_id foreign key
-- 
-- Problem: When a product is deleted from the products table, SQL CASCADE 
-- automatically deletes all orders referencing that product_id.
--
-- Fix: Change the foreign key constraint from ON DELETE CASCADE to ON DELETE SET NULL.
-- This preserves the order records (which still contain product_name, product_price, etc.)
-- while simply nullifying the product_id reference.
--
-- The code already calls nullifyProductOnOrders() before deleting a product,
-- but this DB-level change provides a safety net.

-- Step 1: Drop the existing foreign key constraint with CASCADE
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_product_id_fkey;

-- Step 2: Re-add it with SET NULL instead of CASCADE
ALTER TABLE orders 
ADD CONSTRAINT orders_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE SET NULL;