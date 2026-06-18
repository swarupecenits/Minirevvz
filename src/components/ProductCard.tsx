import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../lib/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useStore } from '../lib/store';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = React.memo(function ProductCard({ product }: ProductCardProps) {
  const isSoldOut = product.quantity === 0;
  const { addToCart, cart } = useStore();
  const cartItem = cart.find((item) => item.productId === product.id);
  const inCartQuantity = cartItem?.quantity ?? 0;
  const canAddMore = !isSoldOut && inCartQuantity < product.quantity;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canAddMore) {
      addToCart(product, 1);
    }
  }, [addToCart, product, canAddMore]);

  return (
    <div className="group flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950 shadow-lg transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.65)]">
      <Link
        to={`/products/${product.id}`}
        className="flex flex-col"
      >
        <div className="relative aspect-square overflow-hidden bg-zinc-900">
          <img
            src={
              product.images[0] ||
              'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800'
            }
            alt={product.name}
            className="h-full w-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />

          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 flex flex-wrap gap-1.5 max-w-[70%]">
            {product.category === 'Sale' && <Badge variant="sale">Sale</Badge>}
            {product.isPremium && <Badge variant="premium">Premium</Badge>}
            {product.isNewArrival && <Badge variant="success">New</Badge>}
          </div>

          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-10">
            <Badge
              variant={
                isSoldOut
                  ? 'danger'
                  : product.quantity < 3
                    ? 'warning'
                    : 'success'
              }
            >
              {isSoldOut ? 'Sold Out' : `${product.quantity} in stock`}
            </Badge>
          </div>
        </div>

        <div className="relative z-10 flex flex-col flex-grow gap-2 p-3.5 sm:p-4 pt-2 border-t border-white/5 bg-zinc-950/60">
          <div className="text-[10px] sm:text-xs text-zinc-500 font-medium tracking-widest uppercase truncate">
            {product.brand} • {product.category}
          </div>

          <h3 className="text-sm sm:text-base font-display font-semibold text-zinc-100 line-clamp-2 leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-end justify-between gap-2 mt-0.5">
            <div className="text-lg sm:text-xl font-display font-bold text-zinc-50">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            {product.scale && (
              <span className="text-[10px] sm:text-xs text-zinc-500 shrink-0">{product.scale}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 flex gap-2">
        {!isSoldOut && (
          <button
            onClick={handleAddToCart}
            disabled={!canAddMore}
            className={`flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
              canAddMore
                ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-white/10 hover:border-white/20'
                : inCartQuantity > 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                  : 'bg-zinc-800/50 text-zinc-500 border border-white/5 cursor-not-allowed'
            }`}
            aria-label={canAddMore ? `Add ${product.name} to cart` : 'Item in cart'}
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>
              {inCartQuantity > 0 ? `${inCartQuantity} in Cart` : 'Add'}
            </span>
          </button>
        )}
        <Link
          to={`/checkout/${product.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1"
        >
          <Button
            variant="primary"
            size="sm"
            className="w-full h-9 text-xs sm:text-sm"
          >
            {isSoldOut ? 'Ask on WhatsApp' : 'Buy Now'}
          </Button>
        </Link>
      </div>
    </div>
  );
});
