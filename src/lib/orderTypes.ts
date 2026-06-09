export type OrderStatus = 'pending_payment' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImageUrl?: string;
  quantity: number;
  totalPrice: number;

  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  customerEmail?: string;

  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;

  customerNote?: string;

  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;

  createdAt: string;
  updatedAt: string;
}

export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerEmail: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  quantity: number;
  customerNote: string;
}

export interface CheckoutValidationErrors {
  [key: string]: string;
}
