import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../lib/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useStore } from '../lib/store';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { settings } = useStore();
  const isSoldOut = product.quantity === 0;

  return (
    <Link
      to={`/checkout/${product.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950 shadow-lg transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.65)]"
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

        <div className="mt-1 flex flex-col gap-2">
          <Button
            variant="primary"
            size="sm"
            className="w-full h-9 text-xs sm:text-sm"
          >
            {isSoldOut ? 'Ask on WhatsApp' : 'Buy Now'}
          </Button>
        </div>
      </div>
    </Link>
  );
}
