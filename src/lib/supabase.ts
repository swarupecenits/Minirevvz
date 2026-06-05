import { supabase } from './supabaseClient';
import { Product } from './types';

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
  return supabase.from('profiles').upsert(profile, { returning: 'representation' });
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

  return {
    publicUrl: urlData?.publicUrl ?? null,
    path: data.path,
    error
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

  return {
    publicUrl: urlData?.publicUrl ?? null,
    path: data.path,
    error
  };
}

export async function createProduct(product: ProductPayload) {
  return supabase.from('products').insert([product]);
}

export async function updateProductSupabase(id: string, product: Partial<ProductPayload>) {
  return supabase.from('products').update(product).eq('id', id);
}

export async function deleteProductSupabase(id: string) {
  return supabase.from('products').delete().eq('id', id);
}

export async function fetchAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function fetchProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

