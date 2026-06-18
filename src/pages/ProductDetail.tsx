import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Truck, ChevronRight, ShoppingCart } from 'lucide-react';
import { WhatsAppIcon } from '../components/icons/WhatsAppIcon';
import { CheckoutForm } from '../components/CheckoutForm';
import { CheckoutConfirmation } from '../components/CheckoutConfirmation';
import { useStore } from '../lib/store';
import { isProductPublic } from '../lib/types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { buildWhatsAppUrl, getProductEnquiryMessage, getOrderConfirmationMessage } from '../lib/whatsapp';
import { createOrderWithStockDeduction } from '../lib/supabase';
import { CheckoutFormData, Order } from '../lib/orderTypes';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, settings, trackWhatsAppClick, addToCart, cart } = useStore();
  const product = products.find((p) => p.id === id && isProductPublic(p));
  const [activeImage, setActiveImage] = useState(0);

  // Checkout state
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [checkoutFormData, setCheckoutFormData] = useState<CheckoutFormData | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string>('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const cartItem = cart.find((item) => item.productId === product?.id);
  const inCartQuantity = cartItem?.quantity ?? 0;
  const isSoldOut = product ? product.quantity === 0 : true;
  const canAddMore = !isSoldOut && product && inCartQuantity < product.quantity;

  const handleAddToCart = useCallback(() => {
    if (canAddMore && product) {
      addToCart(product, 1);
    }
  }, [addToCart, product, canAddMore]);

  if (!product) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-display font-bold mb-4">
          Product Not Found
        </h2>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  const handleBuyClick = () => {
    if (isSoldOut) {
      // If sold out, show inquiry message instead
      trackWhatsAppClick(product.id);
      const message = getProductEnquiryMessage(
        product.name,
        product.category,
        product.price,
        true
      );
      const url = buildWhatsAppUrl(settings.whatsappNumber, message);
      window.open(url, '_blank');
    } else {
      // Otherwise open checkout form
      setShowCheckoutForm(true);
      setOrderError('');
    }
  };

  const handleCheckoutSubmit = (formData: CheckoutFormData) => {
    setCheckoutFormData(formData);
    setShowCheckoutForm(false);
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
        setShowConfirmation(true);
        return;
      }

      if (!orderData) {
        setOrderError('No order data returned. Please try again.');
        setShowConfirmation(true);
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

      // Close modals and redirect to WhatsApp
      setShowConfirmation(false);
      setCheckoutFormData(null);
      window.open(url, '_blank');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error creating order:', err);
      setOrderError(errorMessage);
      setShowConfirmation(true);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleEditOrder = () => {
    setShowConfirmation(false);
    setShowCheckoutForm(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckoutForm(false);
    setShowConfirmation(false);
    setCheckoutFormData(null);
    setOrderError('');
  };

  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <button
          onClick={() => navigate('/products')}
          className="hover:text-zinc-300 transition-colors"
        >
          Products
        </button>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={() => navigate(`/products?category=${product.category}`)}
          className="hover:text-zinc-300 transition-colors"
        >
          {product.category}
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-zinc-300 truncate max-w-[200px]">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-zinc-800/40 via-zinc-900 to-zinc-950 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.08)_0%,transparent_65%)]" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,209,102,0.06)_0%,transparent_70%)]" />

            <img
              src={
                product.images[activeImage] ||
                'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1200'
              }
              alt={product.name}
              className="relative z-10 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
            />

            {product.isPremium && (
              <div className="absolute top-4 left-4 z-20">
                <Badge variant="premium">Premium Collection</Badge>
              </div>
            )}
          </motion.div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 bg-zinc-900 transition-all ${
                    activeImage === idx
                      ? 'border-zinc-100 opacity-100 ring-2 ring-zinc-100/20'
                      : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/25'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="h-full w-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <motion.div
          initial={{
            opacity: 0,
            x: 20
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          className="flex flex-col"
        >
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4 gap-4 flex-col sm:flex-row">
              <div className="space-y-2">
                <span className="text-sm font-medium text-zinc-400 tracking-wider uppercase">
                  {product.brand}
                </span>
                {product.category === 'Sale' && (
                  <Badge variant="sale">Flash Sale</Badge>
                )}
              </div>
              <Badge
                variant={
                  isSoldOut ? 'danger' : product.quantity < 3 ? 'warning' : 'success'
                }
              >
                {isSoldOut ? 'Sold Out' : `${product.quantity} in stock`}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-zinc-100 mb-4 leading-tight">
              {product.name}
            </h1>
            <div className="text-3xl font-display font-bold text-zinc-100">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
          </div>

          <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
            {product.description || product.shortDescription}
          </p>

          <div className="glass-panel rounded-2xl p-6 mb-8 space-y-4">
            <h3 className="font-display font-semibold text-zinc-100 mb-4">
              Model Specifications
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              {product.scale && (
                <div>
                  <span className="text-zinc-500 block mb-1">Scale</span>
                  <span className="text-zinc-200 font-medium">{product.scale}</span>
                </div>
              )}
              {product.series && (
                <div>
                  <span className="text-zinc-500 block mb-1">Series</span>
                  <span className="text-zinc-200 font-medium">{product.series}</span>
                </div>
              )}
              {product.year && (
                <div>
                  <span className="text-zinc-500 block mb-1">Year</span>
                  <span className="text-zinc-200 font-medium">{product.year}</span>
                </div>
              )}
              {product.packagingCondition && (
                <div>
                  <span className="text-zinc-500 block mb-1">Condition</span>
                  <span className="text-zinc-200 font-medium">
                    {product.packagingCondition}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto space-y-4">
            {!isSoldOut && (
              <button
                onClick={handleAddToCart}
                disabled={!canAddMore}
                className={`w-full flex items-center justify-center gap-2 h-auto min-h-12 py-3 px-4 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
                  canAddMore
                    ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-white/10 hover:border-white/20'
                    : inCartQuantity > 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                      : 'bg-zinc-800/50 text-zinc-500 border border-white/5 cursor-not-allowed'
                }`}
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-5 h-5 shrink-0" />
                <span>
                  {inCartQuantity > 0
                    ? `${inCartQuantity} in Cart${canAddMore ? ' - Add More' : ''}`
                    : 'Add to Cart'}
                </span>
              </button>
            )}
            <Button
              size="lg"
              variant={isSoldOut ? 'outline' : 'primary'}
              className="w-full gap-2 h-auto min-h-14 py-3 px-4 text-sm sm:text-base lg:text-lg leading-snug whitespace-normal text-center"
              disabled={isCreatingOrder}
              onClick={handleBuyClick}
            >
              {isCreatingOrder ? (
                <>
                  <span>Creating Order...</span>
                </>
              ) : isSoldOut ? (
                <>
                  <WhatsAppIcon className="w-5 h-5 shrink-0" />
                  <span>
                    <span className="sm:hidden">Ask on WhatsApp</span>
                    <span className="hidden sm:inline">Ask for Availability on WhatsApp</span>
                  </span>
                </>
              ) : (
                <>
                  <span>Buy Now</span>
                </>
              )}
            </Button>
            <p className="text-center text-sm text-zinc-500">
              {isSoldOut
                ? 'This item is currently sold out. Contact us on WhatsApp for inquiries.'
                : 'Add to cart to save for later, or Buy Now to complete your purchase.'}
            </p>
            {orderError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {orderError}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 text-zinc-400">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-sm">Verified Authentic</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <Truck className="w-5 h-5 text-blue-500" />
              <span className="text-sm">Secure Shipping</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Checkout Modals */}
      {showCheckoutForm && (
        <CheckoutForm
          productName={product.name}
          maxQuantity={product.quantity}
          onSubmit={handleCheckoutSubmit}
          onClose={handleCloseCheckout}
        />
      )}

      {showConfirmation && checkoutFormData && (
        <CheckoutConfirmation
          productName={product.name}
          productPrice={product.price}
          productImage={product.images[0]}
          formData={checkoutFormData}
          onConfirm={handleConfirmOrder}
          onEdit={handleEditOrder}
          onClose={handleCloseCheckout}
          isLoading={isCreatingOrder}
        />
      )}
    </div>
  );
}