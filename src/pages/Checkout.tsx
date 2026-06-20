import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Truck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useStore } from '../lib/store';
import { isProductPublic } from '../lib/types';
import { createOrderWithStockDeduction } from '../lib/supabase';
import { buildWhatsAppUrl, getOrderConfirmationMessage } from '../lib/whatsapp';
import { CheckoutFormData, Order } from '../lib/orderTypes';
import { validateCheckoutForm } from '../lib/orderValidation';
import { calculateShipping, getShippingLabel } from '../lib/shipping';

// --- Reusable uncontrolled InputField (top-level, no nested components) ---

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  defaultValue?: string;
  error?: string;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const InputField = React.memo(function InputField({
  label,
  name,
  type = 'text',
  required = false,
  placeholder = '',
  rows,
  defaultValue = '',
  error,
  onBlur
}: InputFieldProps) {
  const hasError = !!error;
  const isTextarea = rows !== undefined;

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {isTextarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          onBlur={onBlur}
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
          defaultValue={defaultValue}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all ${
            hasError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/10 focus:ring-2 focus:ring-zinc-500'
          }`}
        />
      )}
      {hasError && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

// --- Checkout Form Component (top-level, no nested component definitions) ---

interface CheckoutFormComponentProps {
  maxQuantity: number;
  onSubmit: (data: CheckoutFormData) => void;
}

function CheckoutFormComponent({ maxQuantity, onSubmit }: CheckoutFormComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getFormData = useCallback((): CheckoutFormData => {
    if (!formRef.current) {
      return {
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
      };
    }
    const formDataObj = new FormData(formRef.current);
    return {
      customerName: (formDataObj.get('customerName') as string) || '',
      customerPhone: (formDataObj.get('customerPhone') as string) || '',
      customerWhatsapp: (formDataObj.get('customerWhatsapp') as string) || '',
      customerEmail: (formDataObj.get('customerEmail') as string) || '',
      address: (formDataObj.get('address') as string) || '',
      city: (formDataObj.get('city') as string) || '',
      state: (formDataObj.get('state') as string) || '',
      pincode: (formDataObj.get('pincode') as string) || '',
      landmark: (formDataObj.get('landmark') as string) || '',
      quantity: parseInt(formDataObj.get('quantity') as string, 10) || 1,
      customerNote: (formDataObj.get('customerNote') as string) || ''
    };
  }, []);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    const formData = getFormData();
    const validationErrors = validateCheckoutForm(formData, maxQuantity);
    setErrors((prev) => {
      const updated = { ...prev };
      if (validationErrors[name]) {
        updated[name] = validationErrors[name];
      } else {
        delete updated[name];
      }
      return updated;
    });
  }, [getFormData]);

  const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleBlur(e as React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>);
  }, [handleBlur]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = getFormData();
    const validationErrors = validateCheckoutForm(formData, maxQuantity);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Information */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Your Information</h3>
        <div className="space-y-4">
          <InputField
            label="Full Name"
            name="customerName"
            required
            placeholder="John Doe"
            error={errors.customerName}
            onBlur={handleInputBlur}
          />
          <InputField
            label="Phone Number"
            name="customerPhone"
            type="tel"
            required
            placeholder="+91 9876543210"
            error={errors.customerPhone}
            onBlur={handleInputBlur}
          />
          <InputField
            label="WhatsApp Number (if different)"
            name="customerWhatsapp"
            type="tel"
            placeholder="+91 9876543210"
            error={errors.customerWhatsapp}
            onBlur={handleInputBlur}
          />
          <InputField
            label="Email Address (optional)"
            name="customerEmail"
            type="email"
            placeholder="you@example.com"
            error={errors.customerEmail}
            onBlur={handleInputBlur}
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
            error={errors.address}
            onBlur={handleInputBlur}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="City" name="city" required placeholder="Delhi" error={errors.city} onBlur={handleInputBlur} />
            <InputField label="State" name="state" required placeholder="Delhi" error={errors.state} onBlur={handleInputBlur} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Pincode" name="pincode" required placeholder="110001" error={errors.pincode} onBlur={handleInputBlur} />
            <InputField label="Landmark (optional)" name="landmark" placeholder="Near Metro Station" error={errors.landmark} onBlur={handleInputBlur} />
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
              defaultValue={1}
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
            error={errors.customerNote}
            onBlur={handleInputBlur}
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

// --- Checkout Confirmation Component (top-level) ---

interface CheckoutConfirmationComponentProps {
  product: any;
  formData: CheckoutFormData;
  onConfirm: () => Promise<void>;
  onEdit: () => void;
  isLoading: boolean;
  orderError: string;
  shipping: number;
  shippingLabel: string;
}

function CheckoutConfirmationComponent({
  product,
  formData,
  onConfirm,
  onEdit,
  isLoading,
  orderError,
  shipping,
  shippingLabel
}: CheckoutConfirmationComponentProps) {
  const totalPrice = product.price * formData.quantity;
  const grandTotal = totalPrice + shipping;

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

          <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
            <p className="text-zinc-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              {shippingLabel}
            </p>
            <p className="text-zinc-100 font-medium">₹{shipping.toLocaleString('en-IN')}</p>
          </div>
          <div className="flex justify-between items-center pt-4">
            <p className="text-lg font-semibold text-zinc-100">Grand Total</p>
            <p className="text-2xl font-bold text-amber-400">₹{grandTotal.toLocaleString('en-IN')}</p>
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
          {isLoading ? 'Processing...' : (
            <>
              <span className="sm:hidden">Confirm on WhatsApp</span>
              <span className="hidden sm:inline">Confirm & Pay on WhatsApp</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// --- Main Checkout Page ---

export function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, settings, updateProduct, trackWhatsAppClick } = useStore();
  const product = products.find((p) => p.id === id && isProductPublic(p));

  // Checkout state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [checkoutFormData, setCheckoutFormData] = useState<CheckoutFormData | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string>('');

  // Shipping: quantity from form data or default 1
  const formQuantity = checkoutFormData?.quantity ?? 1;
  const shipping = useMemo(() => calculateShipping(formQuantity), [formQuantity]);
  const shippingLabel = useMemo(() => getShippingLabel(formQuantity), [formQuantity]);

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
    const errors = validateCheckoutForm(formData, product.quantity);
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

      // Update local store quantity so public users see the updated stock immediately
      updateProduct(product.id, { quantity: product.quantity - checkoutFormData.quantity });

      // Immediately persist to localStorage so the update survives the WhatsApp redirect
      try {
        const saved = localStorage.getItem('minirevvz_store_v3');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.products = parsed.products.map((p: any) => {
            if (p.id === product.id) {
              return { ...p, quantity: product.quantity - checkoutFormData.quantity };
            }
            return p;
          });
          localStorage.setItem('minirevvz_store_v3', JSON.stringify(parsed));
        }
      } catch (e) {
        // Silently fail - store update works without localStorage
      }

      trackWhatsAppClick(product.id);

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

      // Build WhatsApp message with shipping info
      const lines: string[] = [];
      lines.push(`Hello! I have placed an order on your website.`);
      lines.push(``);
      lines.push(`Order ID: ${order.id}`);
      lines.push(`Product: ${order.productName}`);
      lines.push(`Quantity: ${order.quantity}`);
      lines.push(`Unit Price: ₹${order.productPrice.toLocaleString('en-IN')}`);
      lines.push(`Total: ₹${order.totalPrice.toLocaleString('en-IN')}`);
      lines.push(`Shipping: ₹${shipping.toLocaleString('en-IN')}`);
      lines.push(`Grand Total: ₹${totalPrice + shipping}`);
      lines.push(``);
      lines.push(`Customer Details:`);
      lines.push(`Name: ${order.customerName}`);
      lines.push(`Phone: ${order.customerPhone}`);
      if (order.customerWhatsapp) lines.push(`WhatsApp: ${order.customerWhatsapp}`);
      if (order.customerEmail) lines.push(`Email: ${order.customerEmail}`);
      const fullAddress = `${order.address}, ${order.city}, ${order.state} - ${order.pincode}${order.landmark ? `, Near ${order.landmark}` : ''}`;
      lines.push(`Address: ${fullAddress}`);
      lines.push(``);
      lines.push(`Order Status: ${order.orderStatus}`);
      lines.push(`Payment Status: ${order.paymentStatus}`);
      if (order.customerNote) lines.push(`\nSpecial Notes: ${order.customerNote}`);
      lines.push(``);
      lines.push('I would like to complete the payment for this order.');

      const message = lines.join('\n');
      const url = buildWhatsAppUrl(settings.whatsappNumber, message);

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

        {/* Price Breakdown - shows once form data is available */}
        {checkoutFormData && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Subtotal ({checkoutFormData.quantity} {checkoutFormData.quantity === 1 ? 'item' : 'items'})</span>
              <span className="font-semibold text-zinc-100">₹{(product.price * checkoutFormData.quantity).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                {shippingLabel}
              </span>
              <span className="font-semibold text-zinc-100">₹{shipping.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-zinc-100 font-semibold">Grand Total</span>
              <span className="text-xl font-bold text-amber-400">₹{(product.price * checkoutFormData.quantity + shipping).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Form or Confirmation */}
      {!showConfirmation ? (
        <CheckoutFormComponent
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
          shipping={shipping}
          shippingLabel={shippingLabel}
        />
      ) : null}
    </div>
  );
}
