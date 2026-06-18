import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ShoppingBag, Loader, Truck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useStore } from '../lib/store';
import { createOrderWithStockDeduction } from '../lib/supabase';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import { CheckoutFormData, Order } from '../lib/orderTypes';
import { validateCheckoutForm } from '../lib/orderValidation';
import { calculateShipping, getShippingLabel } from '../lib/shipping';

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

export function CartCheckout() {
  const navigate = useNavigate();
  const { cart, cartTotal, cartCount, clearCart, settings, trackWhatsAppClick } = useStore();
  const shipping = useMemo(() => calculateShipping(cartCount), [cartCount]);
  const grandTotal = useMemo(() => cartTotal + shipping, [cartTotal, shipping]);

  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Confirmation state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [checkoutFormData, setCheckoutFormData] = useState<CheckoutFormData | null>(null);
  const [isCreatingOrders, setIsCreatingOrders] = useState(false);
  const [orderError, setOrderError] = useState<string>('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      quantity: 1,
      customerNote: (formDataObj.get('customerNote') as string) || ''
    };
  }, []);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    const formData = getFormData();
    const validationErrors = validateCheckoutForm(formData, 999);
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
    const validationErrors = validateCheckoutForm(formData, 999);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setCheckoutFormData(formData);
    setShowConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    if (!checkoutFormData || cart.length === 0) return;

    setIsCreatingOrders(true);
    setOrderError('');

    const createdOrders: Order[] = [];

    try {
      // Create orders for each cart item
      for (const cartItem of cart) {
        const totalPrice = cartItem.product.price * cartItem.quantity;

        const { data: orderData, error } = await createOrderWithStockDeduction(
          cartItem.productId,
          cartItem.quantity,
          {
            product_id: cartItem.productId,
            product_name: cartItem.product.name,
            product_price: cartItem.product.price,
            product_image_url: cartItem.product.images[0],
            quantity: cartItem.quantity,
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
          throw new Error(`Failed to create order for ${cartItem.product.name}: ${error.message}`);
        }

        if (!orderData) {
          throw new Error(`No order data returned for ${cartItem.product.name}`);
        }

        trackWhatsAppClick(cartItem.productId);

        const order: Order = {
          id: orderData.id || '',
          productId: cartItem.productId,
          productName: cartItem.product.name,
          productPrice: cartItem.product.price,
          productImageUrl: cartItem.product.images[0],
          quantity: cartItem.quantity,
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

        createdOrders.push(order);
      }

      // Clear the cart
      clearCart();

      // Generate a consolidated WhatsApp message with all orders
      const lines: string[] = [];
      lines.push(`Hello! I have placed an order on your website.\n`);

      for (const order of createdOrders) {
        lines.push(`Order ID: ${order.id}`);
        lines.push(`Product: ${order.productName}`);
        lines.push(`Quantity: ${order.quantity}`);
        lines.push(`Unit Price: ₹${order.productPrice.toLocaleString('en-IN')}`);
        lines.push(`Total: ₹${order.totalPrice.toLocaleString('en-IN')}`);
        lines.push('---');
      }

      const itemsGrandTotal = createdOrders.reduce((sum, o) => sum + o.totalPrice, 0);
      lines.push(`\nShipping: ₹${shipping.toLocaleString('en-IN')}`);
      const totalWithShipping = itemsGrandTotal + shipping;
      lines.push(`Grand Total (incl. shipping): ₹${totalWithShipping.toLocaleString('en-IN')}`);
      lines.push('');

      const firstOrder = createdOrders[0];
      lines.push(`Customer Details:`);
      lines.push(`Name: ${firstOrder.customerName}`);
      lines.push(`Phone: ${firstOrder.customerPhone}`);
      if (firstOrder.customerWhatsapp) lines.push(`WhatsApp: ${firstOrder.customerWhatsapp}`);
      if (firstOrder.customerEmail) lines.push(`Email: ${firstOrder.customerEmail}`);

      const fullAddress = `${firstOrder.address}, ${firstOrder.city}, ${firstOrder.state} - ${firstOrder.pincode}${firstOrder.landmark ? `, Near ${firstOrder.landmark}` : ''}`;
      lines.push(`Address: ${fullAddress}`);
      lines.push(`\nOrder Status: pending_payment`);
      lines.push(`Payment Status: unpaid`);

      if (firstOrder.customerNote) {
        lines.push(`\nSpecial Notes: ${firstOrder.customerNote}`);
      }

      lines.push('\nI would like to complete the payment for this order.');

      const message = lines.join('\n');
      const url = buildWhatsAppUrl(settings.whatsappNumber, message);

      window.location.href = url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error creating orders:', err);
      setOrderError(errorMessage);
    } finally {
      setIsCreatingOrders(false);
    }
  };

  if (cart.length === 0 && !showConfirmation) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center max-w-7xl mx-auto px-4">
        <ShoppingBag className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-2xl font-display font-bold text-zinc-100 mb-2">Your cart is empty</h2>
        <p className="text-zinc-400 mb-8">Add some items to your cart before checking out.</p>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-100">Checkout</h1>
          <p className="text-zinc-400 mt-1">
            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      {/* Cart Summary */}
      <div className="glass-panel rounded-2xl p-6 mb-8 border border-white/10">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Order Summary
        </h2>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/5">
                <img
                  src={item.product.images[0] || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800'}
                  alt={item.product.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">{item.product.name}</p>
                <p className="text-xs text-zinc-500">Qty: {item.quantity} × ₹{item.product.price.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-sm font-semibold text-amber-400 shrink-0">
                ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
            <span className="font-semibold text-zinc-100">₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              {getShippingLabel(cartCount)}
            </span>
            <span className="font-semibold text-zinc-100">₹{shipping.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-zinc-100 font-semibold">Total</span>
            <span className="text-xl font-bold text-amber-400">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Form or Confirmation */}
      {!showConfirmation ? (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Your Information</h3>
            <div className="space-y-4">
              <InputField label="Full Name" name="customerName" required placeholder="John Doe" error={errors.customerName} onBlur={handleInputBlur} />
              <InputField label="Phone Number" name="customerPhone" type="tel" required placeholder="+91 9876543210" error={errors.customerPhone} onBlur={handleInputBlur} />
              <InputField label="WhatsApp Number (if different)" name="customerWhatsapp" type="tel" placeholder="+91 9876543210" error={errors.customerWhatsapp} onBlur={handleInputBlur} />
              <InputField label="Email Address (optional)" name="customerEmail" type="email" placeholder="you@example.com" error={errors.customerEmail} onBlur={handleInputBlur} />
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Delivery Address</h3>
            <div className="space-y-4">
              <InputField label="Full Address" name="address" required placeholder="House No., Street, Locality" error={errors.address} onBlur={handleInputBlur} />
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

          {/* Special Notes */}
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Additional Details</h3>
            <InputField
              label="Any Special Notes (optional)"
              name="customerNote"
              placeholder="E.g., prefer morning delivery, packaging instructions, etc."
              rows={3}
              error={errors.customerNote}
              onBlur={handleInputBlur}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => navigate('/products')} className="flex-1">
              Continue Shopping
            </Button>
            <Button type="submit" className="flex-1 flex items-center justify-center gap-2">
              Review Order
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      ) : checkoutFormData ? (
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Order Summary</h3>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between pb-2 border-b border-white/10 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-100 truncate">{item.product.name}</p>
                    <p className="text-xs text-zinc-500">{item.quantity}x @ ₹{item.product.price.toLocaleString('en-IN')}</p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-100 shrink-0">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
              <div className="flex justify-between items-center text-sm pt-2 border-t border-white/10">
                <p className="text-zinc-400">{getShippingLabel(cartCount)}</p>
                <p className="text-zinc-100 font-medium">₹{shipping.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <p className="text-lg font-semibold text-zinc-100">Grand Total</p>
                <p className="text-2xl font-bold text-emerald-400">₹{grandTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Delivery Information</h3>
            <div className="space-y-3 text-sm">
              <div><p className="text-zinc-500 mb-1">Customer Name</p><p className="text-zinc-100">{checkoutFormData.customerName}</p></div>
              <div><p className="text-zinc-500 mb-1">Phone</p><p className="text-zinc-100">{checkoutFormData.customerPhone}</p></div>
              {checkoutFormData.customerWhatsapp && <div><p className="text-zinc-500 mb-1">WhatsApp</p><p className="text-zinc-100">{checkoutFormData.customerWhatsapp}</p></div>}
              {checkoutFormData.customerEmail && <div><p className="text-zinc-500 mb-1">Email</p><p className="text-zinc-100">{checkoutFormData.customerEmail}</p></div>}
              <div>
                <p className="text-zinc-500 mb-1">Address</p>
                <p className="text-zinc-100">
                  {checkoutFormData.address}
                  {checkoutFormData.landmark && `, ${checkoutFormData.landmark}`}<br />
                  {checkoutFormData.city}, {checkoutFormData.state} - {checkoutFormData.pincode}
                </p>
              </div>
              {checkoutFormData.customerNote && (
                <div><p className="text-zinc-500 mb-1">Special Notes</p><p className="text-zinc-100">{checkoutFormData.customerNote}</p></div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-emerald-500/5">
            <p className="text-zinc-100">
              After confirming, you'll be redirected to WhatsApp to discuss payment and finalize your order with us.
            </p>
          </div>

          {/* Error */}
          {orderError && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              <p className="font-semibold mb-2">Order Creation Failed</p>
              <p className="text-sm">{orderError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setShowConfirmation(false)} disabled={isCreatingOrders} className="flex-1">
              Edit Details
            </Button>
            <Button type="button" onClick={handleConfirmOrder} disabled={isCreatingOrders} className="flex-1">
              {isCreatingOrders ? (
                <><Loader className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <><span className="sm:hidden">Confirm on WhatsApp</span><span className="hidden sm:inline">Confirm & Pay on WhatsApp</span></>
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}