import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  ArrowLeft,
  ShieldCheck,
  Truck,
  ChevronRight } from
'lucide-react';
import { useStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { buildWhatsAppUrl, getProductEnquiryMessage } from '../lib/whatsapp';
export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, settings, trackWhatsAppClick } = useStore();
  const product = products.find((p) => p.id === id);
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  if (!product) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-display font-bold mb-4">
          Product Not Found
        </h2>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>);

  }
  const isSoldOut = product.availability === 'Sold Out';
  const handleWhatsAppClick = () => {
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
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <button
          onClick={() => navigate('/products')}
          className="hover:text-zinc-300 transition-colors">
          
          Products
        </button>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={() => navigate(`/products?category=${product.category}`)}
          className="hover:text-zinc-300 transition-colors">
          
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
            className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 relative group">
            
            <img
              src={
              product.images[activeImage] ||
              'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1200'
              }
              alt={product.name}
              className="w-full h-full object-cover" />
            
            {product.isPremium &&
            <div className="absolute top-4 left-4">
                <Badge variant="premium">Premium Collection</Badge>
              </div>
            }
          </motion.div>

          {product.images.length > 1 &&
          <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) =>
            <button
              key={idx}
              onClick={() => setActiveImage(idx)}
              className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-zinc-100 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}>
              
                  <img
                src={img}
                alt={`${product.name} ${idx + 1}`}
                className="w-full h-full object-cover" />
              
                </button>
            )}
            </div>
          }
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
          className="flex flex-col">
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-400 tracking-wider uppercase">
                {product.brand}
              </span>
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
            <h1 className="text-3xl md:text-4xl font-display font-bold text-zinc-100 mb-4 leading-tight">
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
              {product.scale &&
              <div>
                  <span className="text-zinc-500 block mb-1">Scale</span>
                  <span className="text-zinc-200 font-medium">
                    {product.scale}
                  </span>
                </div>
              }
              {product.series &&
              <div>
                  <span className="text-zinc-500 block mb-1">Series</span>
                  <span className="text-zinc-200 font-medium">
                    {product.series}
                  </span>
                </div>
              }
              {product.year &&
              <div>
                  <span className="text-zinc-500 block mb-1">Year</span>
                  <span className="text-zinc-200 font-medium">
                    {product.year}
                  </span>
                </div>
              }
              {product.packagingCondition &&
              <div>
                  <span className="text-zinc-500 block mb-1">Condition</span>
                  <span className="text-zinc-200 font-medium">
                    {product.packagingCondition}
                  </span>
                </div>
              }
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <Button
              size="lg"
              variant={isSoldOut ? 'outline' : 'whatsapp'}
              className="w-full text-lg"
              onClick={handleWhatsAppClick}>
              
              <MessageCircle className="w-5 h-5 mr-2" />
              {isSoldOut ?
              'Ask for Availability on WhatsApp' :
              'Buy on WhatsApp'}
            </Button>
            <p className="text-center text-sm text-zinc-500">
              No payment required now. You will be redirected to WhatsApp to
              discuss purchase details directly with us.
            </p>
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
    </div>);

}