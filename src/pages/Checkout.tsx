import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useStore } from '../lib/store';
import { isProductPublic } from '../lib/types';
import { createOrderWithStockDeduction } from '../lib/supabase';
import { buildWhatsAppUrl, getOrderConfirmationMessage } from '../lib/whatsapp';
import { CheckoutFormData, Order } from '../lib/orderTypes';
import { validateCheckoutForm } from '../lib/orderValidation';

export function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, settings, trackWhatsAppClick } = useStore();
  const product = products.find((p) => p.id === id && isProductPublic(p));

  // Checkout state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [checkoutFormData, setCheckoutFormData] = useState<CheckoutFormData | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string>('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-display font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  const isSoldOut = product.quantity === 0;

  if (isSoldOut) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-display font-bold mb-4">Product Sold Out</h2>
        <p className="text-zinc-400 mb-8">This item is currently out of stock.</p>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  const handleCheckoutSubmit = (formData: CheckoutFormData) => {
    const errors = validateCheckoutForm(formData);
    if (Object.keys(errors).length > 0) {
      console.log('Validation errors:', errors);
      return;
    }
    setCheckoutFormData(formData);
    setShowConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    if (!checkoutFormData || !product) return;

    setIsCreatingOrder(true);
    setOrderError('');

    try {
      const totalPrice = product.price * checkoutFormData.quantity;

      // Create order with stock deduction
      const { data: orderData, error } = await createOrderWithStockDeduction(
        product.id,
        checkoutFormData.quantity,
        {
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_image_url: product.images[0],
          quantity: checkoutFormData.quantity,
          total_price: totalPrice,
          customer_name: checkoutFormData.customerName,
          customer_phone: checkoutFormData.customerPhone,
          customer_whatsapp: checkoutFormData.customerWhatsapp || undefined,
          customer_email: checkoutFormData.customerEmail || undefined,
          address: checkoutFormData.address,
          city: checkoutFormData.city,
          state: checkoutFormData.state,
          pincode: checkoutFormData.pincode,
          landmark: checkoutFormData.landmark || undefined,
          customer_note: checkoutFormData.customerNote || undefined,
          order_status: 'pending_payment',
          payment_status: 'unpaid'
        }
      );

      if (error) {
        console.error('Order creation failed:', error);
        setOrderError(error.message || 'Failed to create order. Please try again.');
        return;
      }

      if (!orderData) {
        setOrderError('No order data returned. Please try again.');
        return;
      }

      // Track the purchase
      trackWhatsAppClick(product.id);

      // Map the returned data to Order type
      const order: Order = {
        id: orderData.id || '',
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        productImageUrl: product.images[0],
        quantity: checkoutFormData.quantity,
        totalPrice: totalPrice,
        customerName: checkoutFormData.customerName,
        customerPhone: checkoutFormData.customerPhone,
        customerWhatsapp: checkoutFormData.customerWhatsapp,
        customerEmail: checkoutFormData.customerEmail,
        address: checkoutFormData.address,
        city: checkoutFormData.city,
        state: checkoutFormData.state,
        pincode: checkoutFormData.pincode,
        landmark: checkoutFormData.landmark,
        customerNote: checkoutFormData.customerNote,
        orderStatus: 'pending_payment',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Generate WhatsApp message with order details
      const message = getOrderConfirmationMessage(order);
      const url = buildWhatsAppUrl(settings.whatsappNumber, message);

      // Redirect to WhatsApp
      window.location.href = url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error creating order:', err);
      setOrderError(errorMessage);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleEditOrder = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-100">Checkout</h1>
          <p className="text-zinc-400 mt-1">{product.name}</p>
        </div>
      </div>

      {/* Product Summary */}
      <div className="glass-panel rounded-2xl p-6 mb-8 border border-white/10">
        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-24 h-24 rounded-xl object-cover object-center"
            />
          </div>
          <div className="flex-grow">
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">{product.name}</h2>
            <p className="text-sm text-zinc-400 mb-3">
              {product.brand} • {product.category}
            </p>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-zinc-500">Price:</span>
                <p className="text-xl font-bold text-zinc-100">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-sm text-zinc-500">In Stock:</span>
                <p className="text-xl font-bold text-emerald-400">{product.quantity} items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Form or Confirmation */}
      {!showConfirmation ? (
        <CheckoutFormComponent
          productName={product.name}
          maxQuantity={product.quantity}
          onSubmit={handleCheckoutSubmit}
        />
      ) : checkoutFormData ? (
        <CheckoutConfirmationComponent
          product={product}
          formData={checkoutFormData}
          onConfirm={handleConfirmOrder}
          onEdit={handleEditOrder}
          isLoading={isCreatingOrder}
          orderError={orderError}
        />
      ) : null}
    </div>
  );
}

interface CheckoutFormComponentProps {
  productName: string;
  maxQuantity: number;
  onSubmit: (data: CheckoutFormData) => void;
}

function CheckoutFormComponent({ productName, maxQuantity, onSubmit }: CheckoutFormComponentProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerPhone: '',
    customerWhatsapp: '',
    customerEmail: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    quantity: 1,
    customerNote: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateCheckoutForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  const InputField = ({
    label,
    name,
    type = 'text',
    placeholder = '',
    required = false,
    rows
  }: {
    label: string;
    name: keyof CheckoutFormData;
    type?: string;
    placeholder?: string;
    required?: boolean;
    rows?: number;
  }) => {
    const hasError = !!errors[name];
    const isTextarea = type === 'textarea';

    return (
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {isTextarea ? (
          <textarea
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all ${
              hasError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/10 focus:ring-2 focus:ring-zinc-500'
            }`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            placeholder={placeholder}
            className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all ${
              hasError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/10 focus:ring-2 focus:ring-zinc-500'
            }`}
          />
        )}
        {hasError && (
          <p className="mt-1 text-sm text-red-400">{errors[name]}</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Information */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Your Information</h3>
        <div className="space-y-4">
          <InputField
            label="Full Name"
            name="customerName"
            required
            placeholder="John Doe"
          />
          <InputField
            label="Phone Number"
            name="customerPhone"
            type="tel"
            required
            placeholder="+91 9876543210"
          />
          <InputField
            label="WhatsApp Number (if different)"
            name="customerWhatsapp"
            type="tel"
            placeholder="+91 9876543210"
          />
          <InputField
            label="Email Address (optional)"
            name="customerEmail"
            type="email"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {/* Delivery Address */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Delivery Address</h3>
        <div className="space-y-4">
          <InputField
            label="Full Address"
            name="address"
            required
            placeholder="House No., Street, Locality"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="City" name="city" required placeholder="Delhi" />
            <InputField label="State" name="state" required placeholder="Delhi" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Pincode" name="pincode" required placeholder="110001" />
            <InputField label="Landmark (optional)" name="landmark" placeholder="Near Metro Station" />
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Order Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Quantity <span className="text-red-400">*</span>
            </label>
            <select
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-2 text-zinc-100 focus:outline-none transition-all border-white/10 focus:ring-2 focus:ring-zinc-500`}
            >
              {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'item' : 'items'}
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="Any Special Notes (optional)"
            name="customerNote"
            type="textarea"
            placeholder="E.g., prefer morning delivery, packaging instructions, etc."
            rows={3}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <Button type="submit" className="flex-1 flex items-center justify-center gap-2">
          Review Order
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}

interface CheckoutConfirmationComponentProps {
  product: any;
  formData: CheckoutFormData;
  onConfirm: () => Promise<void>;
  onEdit: () => void;
  isLoading: boolean;
  orderError: string;
}

function CheckoutConfirmationComponent({
  product,
  formData,
  onConfirm,
  onEdit,
  isLoading,
  orderError
}: CheckoutConfirmationComponentProps) {
  const totalPrice = product.price * formData.quantity;

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Order Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <div>
              <p className="text-zinc-400 text-sm">Product</p>
              <p className="text-zinc-100 font-semibold">{product.name}</p>
            </div>
            <p className="text-zinc-100 font-semibold">₹{product.price.toLocaleString('en-IN')}</p>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <p className="text-zinc-400">Quantity</p>
            <p className="text-zinc-100 font-semibold">{formData.quantity}x</p>
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-lg font-semibold text-zinc-100">Total Price</p>
            <p className="text-2xl font-bold text-emerald-400">₹{totalPrice.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Delivery Information</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-zinc-500 mb-1">Customer Name</p>
            <p className="text-zinc-100">{formData.customerName}</p>
          </div>
          <div>
            <p className="text-zinc-500 mb-1">Phone</p>
            <p className="text-zinc-100">{formData.customerPhone}</p>
          </div>
          {formData.customerEmail && (
            <div>
              <p className="text-zinc-500 mb-1">Email</p>
              <p className="text-zinc-100">{formData.customerEmail}</p>
            </div>
          )}
          <div>
            <p className="text-zinc-500 mb-1">Address</p>
            <p className="text-zinc-100">
              {formData.address}
              {formData.landmark && `, ${formData.landmark}`}
              <br />
              {formData.city}, {formData.state} - {formData.pincode}
            </p>
          </div>
          {formData.customerNote && (
            <div>
              <p className="text-zinc-500 mb-1">Special Notes</p>
              <p className="text-zinc-100">{formData.customerNote}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Message */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-emerald-500/5">
        <p className="text-zinc-100">
          After confirming, you'll be redirected to WhatsApp to discuss payment and finalize the order with us.
        </p>
      </div>

      {/* Error Message */}
      {orderError && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <p className="font-semibold mb-2">Order Creation Failed</p>
          <p className="text-sm mb-4">{orderError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={onEdit}
          disabled={isLoading}
          className="flex-1"
        >
          Edit Details
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Processing...' : 'Confirm & Pay on WhatsApp'}
        </Button>
      </div>
    </div>
  );
}
