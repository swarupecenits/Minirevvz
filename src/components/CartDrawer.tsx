import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2, ChevronRight, Truck } from 'lucide-react';
import { useStore } from '../lib/store';
import { Button } from './ui/Button';
import { calculateShipping, getShippingLabel } from '../lib/shipping';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { cart, cartTotal, cartCount, removeFromCart, updateCartItemQuantity, clearCart } = useStore();
  const shipping = useMemo(() => calculateShipping(cartCount), [cartCount]);
  const grandTotal = useMemo(() => cartTotal + shipping, [cartTotal, shipping]);

  const handleCheckout = useCallback(() => {
    onClose();
    navigate('/checkout/cart');
  }, [navigate, onClose]);

  const handleQuantityDecrease = useCallback((productId: string, currentQty: number) => {
    if (currentQty > 1) {
      updateCartItemQuantity(productId, currentQty - 1);
    } else {
      removeFromCart(productId);
    }
  }, [removeFromCart, updateCartItemQuantity]);

  const handleQuantityIncrease = useCallback((productId: string, currentQty: number, maxQty: number) => {
    if (currentQty < maxQty) {
      updateCartItemQuantity(productId, currentQty + 1);
    }
  }, [updateCartItemQuantity]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-white/10 z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-zinc-100" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-zinc-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <h2 className="text-xl font-display font-bold text-zinc-100">
              Cart
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="w-16 h-16 text-zinc-600 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-400 mb-2">
              Your cart is empty
            </h3>
            <p className="text-zinc-500 text-sm mb-6 max-w-xs">
              Add some products to get started! Browse our collection and find something you love.
            </p>
            <Button variant="primary" onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/5">
                    <img
                      src={
                        item.product.images[0] ||
                        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800'
                      }
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-100 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          ₹{item.product.price.toLocaleString('en-IN')} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-zinc-900 rounded-lg border border-white/10">
                        <button
                          onClick={() => handleQuantityDecrease(item.productId, item.quantity)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-zinc-100 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityIncrease(item.productId, item.quantity, item.product.quantity)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30"
                          disabled={item.quantity >= item.product.quantity}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-amber-400">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-4 sm:p-6 space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                <span className="font-semibold text-zinc-100">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  {getShippingLabel(cartCount)}
                </span>
                <span className="font-semibold text-zinc-100">
                  ₹{shipping.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Grand Total */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-base font-semibold text-zinc-100">Total</span>
                <span className="text-xl font-bold text-amber-400">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="flex-1 text-xs"
                >
                  Clear Cart
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCheckout}
                  className="flex-1 flex items-center justify-center gap-1"
                >
                  Checkout
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CSS for slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  );
}