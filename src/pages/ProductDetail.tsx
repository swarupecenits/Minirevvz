import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Truck, ChevronRight } from 'lucide-react';
import { WhatsAppIcon } from '../components/icons/WhatsAppIcon';
import { useStore } from '../lib/store';
import { isProductPublic } from '../lib/types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { buildWhatsAppUrl, getProductEnquiryMessage } from '../lib/whatsapp';
export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, settings, trackWhatsAppClick } = useStore();
  const product = products.find((p) => p.id === id && isProductPublic(p));
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
      product.price,
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
          className="flex flex-col">
          
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
                product.availability === 'Available' ?
                'success' :
                product.availability === 'Limited Stock' ?
                'warning' :
                'danger'
                }>
                
                {product.availability}
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
              className="w-full gap-2 h-auto min-h-14 py-3 px-4 text-sm sm:text-base lg:text-lg leading-snug whitespace-normal text-center"
              onClick={handleWhatsAppClick}>
              <WhatsAppIcon className={`w-5 h-5 shrink-0 ${isSoldOut ? 'text-[#25D366]' : ''}`} />
              <span>
                {isSoldOut ? (
                  <>
                    <span className="sm:hidden">Ask on WhatsApp</span>
                    <span className="hidden sm:inline">Ask for Availability on WhatsApp</span>
                  </>
                ) : (
                  'Buy on WhatsApp'
                )}
              </span>
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