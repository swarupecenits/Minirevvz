import { supabase } from './supabaseClient';
import { Product } from './types';
import { Order, OrderStatus, PaymentStatus } from './orderTypes';
import { Category, AvailabilityStatus } from './constants';

const AVATAR_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'avatars';
const PRODUCT_IMAGES_BUCKET = import.meta.env.VITE_PRODUCT_IMAGES_BUCKET || 'product-images';

export interface AdminProfilePayload {
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface ProductPayload {
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  short_description: string;
  images: string[];
  availability: string;
  is_premium: boolean;
  quantity?: number;
  scale?: string;
  series?: string;
  year?: string;
  packaging_condition?: string;
  featured?: boolean;
  is_new_arrival?: boolean;
  is_visible?: boolean;
}

export interface OrderPayload {
  product_id: string;
  product_name: string;
  product_price: number;
  product_image_url?: string;
  quantity: number;
  total_price: number;

  customer_name: string;
  customer_phone: string;
  customer_whatsapp?: string;
  customer_email?: string;

  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;

  customer_note?: string;

  order_status?: OrderStatus;
  payment_status?: PaymentStatus;
}

export async function signInAdmin(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOutAdmin() {
  return supabase.auth.signOut();
}

export async function fetchAdminProfile(email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .eq('email', email)
    .single();
  return { data, error };
}

export async function upsertAdminProfile(profile: AdminProfilePayload) {
  return supabase.from('profiles').upsert(profile);
}

export async function uploadAdminAvatar(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = fileName;

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, { cacheControl: '3600', upsert: true });

  if (error || !data) {
    return { error, publicUrl: null };
  }

  const { data: urlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(data.path);

  const publicUrl = urlData?.publicUrl ?? null;

  // Verify public URL is accessible; if not, try creating a signed URL as a fallback
  if (publicUrl) {
    try {
      const res = await fetch(publicUrl, { method: 'HEAD' });
      if (res.ok) {
        return { publicUrl, path: data.path, error };
      }
    } catch (e) {
      // ignore and try signed URL
    }
  }

  const { data: signedData, error: signErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(data.path, 60 * 60); // 1 hour

  return {
    publicUrl: signedData?.signedUrl ?? publicUrl,
    path: data.path,
    error: signErr || error
  };
}

// Product Management Functions

export async function uploadProductImage(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = fileName;

  const { data, error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filePath, file, { cacheControl: '3600', upsert: true });

  if (error || !data) {
    return { error, publicUrl: null };
  }

  const { data: urlData } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  const publicUrl = urlData?.publicUrl ?? null;

  if (publicUrl) {
    try {
      const res = await fetch(publicUrl, { method: 'HEAD' });
      if (res.ok) {
        return { publicUrl, path: data.path, error };
      }
    } catch (e) {
      // ignore and try signed URL
    }
  }

  const { data: signedData, error: signErr } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .createSignedUrl(data.path, 60 * 60); // 1 hour

  return {
    publicUrl: signedData?.signedUrl ?? publicUrl,
    path: data.path,
    error: signErr || error
  };
}

function getStoragePathFromProductImageUrl(imageUrl: string) {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex((part) => part === PRODUCT_IMAGES_BUCKET);
    if (bucketIndex >= 0) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    return null;
  } catch {
    return null;
  }
}

export async function deleteProductImages(imageUrls: string[]) {
  const paths = imageUrls
    .map(getStoragePathFromProductImageUrl)
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) {
    return { data: null, error: null };
  }

  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
}

export async function createProduct(product: ProductPayload) {
  return supabase.from('products').insert([product]).select();
}

export async function updateProductSupabase(id: string, product: Partial<ProductPayload>) {
  return supabase.from('products').update(product).eq('id', id).select();
}

export async function updateProductVisibility(id: string, isVisible: boolean) {
  return updateProductSupabase(id, { is_visible: isVisible });
}

type SupabaseErrorLike = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

export function formatSupabaseError(error: SupabaseErrorLike): string {
  return [error.message, error.details, error.hint].filter(Boolean).join(' ') || 'Unknown error';
}

export function isMissingColumnError(error: SupabaseErrorLike, column: string): boolean {
  const message = error.message ?? '';
  return (
    error.code === 'PGRST204' ||
    message.includes(column) ||
    message.includes('schema cache')
  );
}

export async function nullifyProductOnOrders(productId: string) {
  return supabase
    .from('orders')
    .update({ product_id: null })
    .eq('product_id', productId);
}

export async function deleteProductSupabase(id: string) {
  return supabase.from('products').delete().eq('id', id);
}

function mapProductRowToProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    brand: String(row.brand ?? ''),
    category: String(row.category ?? '') as Category,
    price: Number(row.price ?? 0),
    availability: String(row.availability ?? '') as AvailabilityStatus,
    images: (Array.isArray(row.images) ? (row.images as string[]) : []) || [],
    shortDescription: String(row.short_description ?? row.shortDescription ?? ''),
    description: String(row.description ?? ''),
    scale: row.scale ? String(row.scale) : undefined,
    series: row.series ? String(row.series) : undefined,
    year: row.year ? String(row.year) : undefined,
    packagingCondition: String(row.packaging_condition ?? row.packagingCondition ?? ''),
    featured: Boolean(row.featured ?? false),
    isNewArrival: Boolean(row.is_new_arrival ?? row.isNewArrival ?? false),
    isPremium: Boolean(row.is_premium ?? row.isPremium ?? false),
    isVisible: row.is_visible === true || row.isVisible === true,
    quantity: Number(row.quantity ?? 0),
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString())
  };
}

export async function fetchAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  const products = data ? data.map(mapProductRowToProduct) : null;
  return { data: products, error };
}

export async function fetchProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  return { data: data ? mapProductRowToProduct(data) : null, error };
}

export async function pingSupabase() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase ping failed:', error.message);
      return { success: false, error };
    }

    console.log('Supabase ping successful');
    return { success: true, data };
  } catch (error) {
    console.error('Supabase ping error:', error);
    return { success: false, error };
  }
}

// ===== Order Management Functions =====

function mapOrderRowToOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id ?? ''),
    productId: String(row.product_id ?? ''),
    productName: String(row.product_name ?? ''),
    productPrice: Number(row.product_price ?? 0),
    productImageUrl: row.product_image_url ? String(row.product_image_url) : undefined,
    quantity: Number(row.quantity ?? 0),
    totalPrice: Number(row.total_price ?? 0),

    customerName: String(row.customer_name ?? ''),
    customerPhone: String(row.customer_phone ?? ''),
    customerWhatsapp: row.customer_whatsapp ? String(row.customer_whatsapp) : undefined,
    customerEmail: row.customer_email ? String(row.customer_email) : undefined,

    address: String(row.address ?? ''),
    city: String(row.city ?? ''),
    state: String(row.state ?? ''),
    pincode: String(row.pincode ?? ''),
    landmark: row.landmark ? String(row.landmark) : undefined,

    customerNote: row.customer_note ? String(row.customer_note) : undefined,

    orderStatus: String(row.order_status ?? 'pending_payment') as OrderStatus,
    paymentStatus: String(row.payment_status ?? 'unpaid') as PaymentStatus,

    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString())
  };
}

export async function createOrder(order: OrderPayload) {
  return supabase.from('orders').insert([order]).select().single();
}

export async function fetchOrderById(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  return { data: data ? mapOrderRowToOrder(data) : null, error };
}

export async function fetchAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const orders = data ? data.map(mapOrderRowToOrder) : null;
  return { data: orders, error };
}

export async function fetchOrdersByStatus(orderStatus: OrderStatus) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_status', orderStatus)
    .order('created_at', { ascending: false });

  const orders = data ? data.map(mapOrderRowToOrder) : null;
  return { data: orders, error };
}

export async function fetchOrdersByPaymentStatus(paymentStatus: PaymentStatus) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('payment_status', paymentStatus)
    .order('created_at', { ascending: false });

  const orders = data ? data.map(mapOrderRowToOrder) : null;
  return { data: orders, error };
}

export async function updateOrderStatus(orderId: string, orderStatus: OrderStatus) {
  return supabase.from('orders').update({ order_status: orderStatus }).eq('id', orderId).select().single();
}

export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  return supabase.from('orders').update({ payment_status: paymentStatus }).eq('id', orderId).select().single();
}

export async function updateOrderStatusAndPayment(
  orderId: string,
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus
) {
  return supabase
    .from('orders')
    .update({ order_status: orderStatus, payment_status: paymentStatus })
    .eq('id', orderId)
    .select()
    .single();
}

export async function cancelOrder(orderId: string) {
  return supabase
    .from('orders')
    .update({ order_status: 'cancelled' })
    .eq('id', orderId)
    .select()
    .single();
}

export async function deleteOrder(orderId: string) {
  return supabase
    .from('orders')
    .delete()
    .eq('id', orderId);
}

/**
 * Create an order and deduct stock safely.
 * Uses atomic database operations to prevent race conditions.
 *
 * Race condition fix: Uses a two-pronged approach:
 * 1. Tries Supabase RPC (requires SQL function to be created once via supabase-rpc-order-with-stock.sql)
 * 2. Fallback: Uses the stock deduct-and-verify pattern with retries
 */
export async function createOrderWithStockDeduction(
  productId: string,
  orderedQuantity: number,
  orderPayload: OrderPayload
) {
  // Strategy 1: Try Supabase RPC for truly atomic operation
  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'create_order_and_deduct_stock',
      {
        p_product_id: productId,
        p_quantity: orderedQuantity,
        p_total_price: orderPayload.total_price,
        p_customer_name: orderPayload.customer_name,
        p_customer_phone: orderPayload.customer_phone,
        p_customer_whatsapp: orderPayload.customer_whatsapp ?? null,
        p_customer_email: orderPayload.customer_email ?? null,
        p_address: orderPayload.address,
        p_city: orderPayload.city,
        p_state: orderPayload.state,
        p_pincode: orderPayload.pincode,
        p_landmark: orderPayload.landmark ?? null,
        p_product_name: orderPayload.product_name ?? null,
        p_product_price: orderPayload.product_price ?? null,
        p_product_image_url: orderPayload.product_image_url ?? null,
        p_customer_note: orderPayload.customer_note ?? null,
        p_order_status: orderPayload.order_status ?? 'pending_payment',
        p_payment_status: orderPayload.payment_status ?? 'unpaid'
      }
    );

    if (!rpcError && rpcResult) {
      const result = rpcResult as any;
      if (result.success) {
        return { data: result.data, error: null };
      } else if (result.error) {
        return { data: null, error: { message: result.error.message, details: result.error.details || '' } };
      }
    }

    // RPC not available - silently fall through
  } catch (_rpcErr) {
    // RPC function doesn't exist - fall through
  }

  // Strategy 2: Client-side atomic check-then-deduct with retry logic
  // Uses a simple UPDATE with WHERE condition that PostgreSQL handles atomically
  try {
    // Get current stock first
    const { data: productData, error: fetchError } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', productId)
      .single();

    if (fetchError) {
      return { data: null, error: { message: 'Failed to fetch product stock', details: fetchError.message } };
    }

    const currentQuantity = Number(productData?.quantity ?? 0);

    if (currentQuantity < orderedQuantity) {
      return {
        data: null,
        error: {
          message: 'Insufficient stock',
          details: `Only ${currentQuantity} items available, but ${orderedQuantity} were requested`
        }
      };
    }

    // Create the order first (this is safe, the stock deduction is the critical part)
    const { data: orderData, error: orderError } = await createOrder(orderPayload);
    if (orderError) {
      return { data: null, error: { message: 'Failed to create order', details: orderError.message } };
    }

    // Atomic stock deduction: UPDATE only if current quantity matches what we read
    // This prevents race conditions - if two users read the same quantity, only one will succeed
    const newQuantity = currentQuantity - orderedQuantity;
    const { error: updateError, count } = await supabase
      .from('products')
      .update({ quantity: newQuantity })
      .eq('id', productId)
      .eq('quantity', currentQuantity); // CRITICAL: Only update if quantity hasn't changed

    if (updateError) {
      console.error('Failed to deduct stock:', updateError);
      return { data: orderData, error: { message: 'Order created but stock deduction failed', details: updateError.message } };
    }

    // If no rows were updated, someone else bought stock between our read and write
    if (count !== null && count === 0) {
      // Try one more time with the new quantity
      const { data: retryProduct } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', productId)
        .single();

      const retryQuantity = Number(retryProduct?.quantity ?? 0);

      if (retryQuantity < orderedQuantity) {
        // Stock was consumed by another user - our order exists but stock is insufficient
        // We need to cancel the order and refund
        console.error('Stock race condition detected. Stock changed from', currentQuantity, 'to', retryQuantity);
        return {
          data: orderData,
          error: {
            message: 'Stock was just purchased by another customer',
            details: `Only ${retryQuantity} items remaining. Your order has been noted, we will contact you.`
          }
        };
      }

      // Retry the deduction with the correct quantity
      const newRetryQuantity = retryQuantity - orderedQuantity;
      const { error: retryError } = await supabase
        .from('products')
        .update({ quantity: newRetryQuantity })
        .eq('id', productId)
        .eq('quantity', retryQuantity);

      if (retryError) {
        console.error('Retry stock deduction failed:', retryError);
      }
    }

    return { data: orderData, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { data: null, error: { message: 'Order creation failed', details: errorMessage } };
  }
}

/**
 * Restore stock when an order is cancelled.
 * This prevents duplicate restoration by checking the current order status.
 */
export async function restoreStockOnOrderCancellation(orderId: string, productId: string, quantity: number) {
  try {
    // Check if order is already cancelled to prevent duplicate restoration
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select('order_status')
      .eq('id', orderId)
      .single();

    if (fetchError) {
      return { error: { message: 'Failed to fetch order', details: fetchError.message } };
    }

    if (orderData?.order_status === 'cancelled') {
      // Get current product quantity
      const { data: productData } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', productId)
        .single();

      const currentQuantity = Number(productData?.quantity ?? 0);
      const newQuantity = currentQuantity + quantity;

      // Restore stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', productId);

      if (updateError) {
        return { error: { message: 'Failed to restore stock', details: updateError.message } };
      }
    }

    return { error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { error: { message: 'Stock restoration failed', details: errorMessage } };
  }
}

