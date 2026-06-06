import { supabase } from './supabaseClient';
import { Product } from './types';
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
  scale?: string;
  series?: string;
  year?: string;
  packaging_condition?: string;
  featured?: boolean;
  is_new_arrival?: boolean;
  is_visible?: boolean;
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

