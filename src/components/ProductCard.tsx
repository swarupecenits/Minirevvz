import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../lib/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../lib/store';
import { buildWhatsAppUrl, getProductEnquiryMessage } from '../lib/whatsapp';
interface ProductCardProps {
  product: Product;
}
export function ProductCard({ product }: ProductCardProps) {
  const { settings, trackWhatsAppClick } = useStore();
  const isSoldOut = product.availability === 'Sold Out';
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackWhatsAppClick(product.id);
    const message = getProductEnquiryMessage(
      product.name,
      product.category,
      isSoldOut
    );
    const url = buildWhatsAppUrl(settings.whatsappNumber, message);
    window.open(url, '_blank');
  };
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col glass-panel glass-panel-hover rounded-2xl overflow-hidden">
      
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
        <img
          src={
          product.images[0] ||
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800'
          }
          alt={product.name}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isPremium && <Badge variant="premium">Premium</Badge>}
          {product.isNewArrival && <Badge variant="success">New</Badge>}
        </div>
        <div className="absolute top-3 right-3">
          <Badge
            variant={
            product.availability === 'Available' ?
            'success' :
            product.availability === 'Limited Stock' ?
            'warning' :
            'danger'
            }>
            
            {product.availability}
          </Badge>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="text-xs text-zinc-400 mb-1 font-medium tracking-wider uppercase">
          {product.brand} • {product.category}
        </div>
        <h3 className="text-lg font-display font-semibold text-zinc-100 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
          {product.scale && <span>Scale: {product.scale}</span>}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="text-xl font-display font-bold text-zinc-100">
            ${product.price.toFixed(2)}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={(e) => {

              // Let the Link handle navigation
            }}>
            Details
          </Button>
          <Button
            variant={isSoldOut ? 'outline' : 'whatsapp'}
            className="flex-1 px-0"
            onClick={handleWhatsAppClick}>
            
            <MessageCircle className="w-4 h-4 mr-2" />
            {isSoldOut ? 'Ask' : 'Buy'}
          </Button>
        </div>
      </div>
    </Link>);

}