import { Category, AvailabilityStatus } from './constants';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  availability: AvailabilityStatus;
  images: string[];
  shortDescription: string;
  description: string;
  scale?: string;
  series?: string;
  year?: string;
  packagingCondition?: string;
  featured: boolean;
  isNewArrival: boolean;
  isPremium: boolean;
  isVisible: boolean;
  quantity: number; // Available stock
  createdAt: string;
}

export function isProductPublic(product: Product): boolean {
  return product.isVisible === true;
}

export interface Settings {
  whatsappNumber: string;
  instagram: string;
  email: string;
  location: string;
  businessHours: string;
}

export interface SellerAccount {
  email: string;
  password?: string; // Plaintext for prototype only
  fullName?: string;
}

export interface Analytics {
  whatsappClicks: Record<string, number>; // productId -> count
}