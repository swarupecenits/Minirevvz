import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield } from 'lucide-react';
import { WhatsAppIcon } from '../components/icons/WhatsAppIcon';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/ProductCard';
import LightRays from '../components/LightRays';
import { useStore } from '../lib/store';
import { isProductPublic } from '../lib/types';
import { CATEGORIES, CATEGORY_IMAGES } from '../lib/constants';
const fadeInUp = {
  initial: {
    opacity: 0,
    y: 40
  },
  whileInView: {
    opacity: 1,
    y: 0
  },
  viewport: {
    once: true,
    margin: '-100px'
  },
  transition: {
    duration: 0.7,
    ease: 'easeOut'
  }
};
const staggerContainer = {
  initial: {
    opacity: 0
  },
  whileInView: {
    opacity: 1
  },
  viewport: {
    once: true,
    margin: '-100px'
  },
  transition: {
    staggerChildren: 0.1
  }
};
export function Home() {
  const { products } = useStore();
  const publicProducts = products.filter(isProductPublic);
  const featuredProducts = publicProducts.filter((p) => p.featured).slice(0, 4);
  const newArrivals = publicProducts.filter((p) => p.isNewArrival).slice(0, 4);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/dagggqd6g/image/upload/v1780694229/i-nyoman-adi-wiraputra-ADlbY5Vs9M0-unsplash_col4uh.jpg"
            alt="Premium Diecast"
            className="w-full h-full object-cover opacity-40" />

          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-zinc-950/60 to-zinc-950"></div>
          <div className="absolute inset-0 pointer-events-none">
            <LightRays
              raysOrigin="top-center"
              raysColor="#ffd166"
              raysSpeed={1}
              lightSpread={0.5}
              rayLength={3}
              followMouse={true}
              mouseInfluence={0.1}
              noiseAmount={0}
              distortion={0}
              className="custom-rays"
              pulsating={false}
              fadeDistance={1}
              saturation={1}
            />
          </div>        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 sm:pt-12 lg:pt-0">
          <motion.div
            initial={{
              opacity: 0,
              y: 30
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut'
            }}>

            <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-zinc-300 mb-6 backdrop-blur-md">
              The Ultimate Collector's Destination
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tighter text-zinc-100 mb-6 max-w-4xl mx-auto leading-tight">
            Minirevvz Store <br className="hidden md:block" />
              <span className="text-gradient-silver">
              Every miniature carries a story
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 mb-8 sm:mb-10 max-w-2xl mx-auto font-light">
              Explore imported Hot Wheels, Bburago, CCA, premiums, and exclusive
              Every rev fuels a passion.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/products" className="w-[90%] max-w-md sm:w-auto">
                <Button size="lg" className="sm:w-52 md:w-auto h-12 sm:h-14 px-4 sm:px-8 text-base sm:text-lg">
                  Explore Collection <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/products?category=Premiums" className="w-[90%] max-w-md sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="sm:w-52 md:w-auto h-12 sm:h-14 px-4 sm:px-8 text-base sm:text-lg glass-panel">

                  View Premiums
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Shop by Category
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Find exactly what you're looking for in our neatly organized
              collections.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{
              once: true
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

            {CATEGORIES.map((category) => (
              <motion.div key={category} variants={fadeInUp}>
                <Link
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className="group block relative aspect-square rounded-2xl overflow-hidden glass-panel"
                >
                  {/* Category Image */} <img
                    src={CATEGORY_IMAGES[category]}
                    alt={category}
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700 ease-out"
                  />

                  
                  {/* Dark overlay for premium look */}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />

                  {/* Soft shine hover effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-white/10 via-transparent to-transparent" />

                  {/* Category Text */}
                  <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-400 mb-2">
                      Explore
                    </span>

                    <h3 className="text-lg md:text-xl font-display font-semibold text-zinc-100 group-hover:text-white transition-colors">
                      {category}
                    </h3>
                  </div>
                </Link>
                

              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 &&
        <section className="py-24 bg-zinc-900/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <motion.div {...fadeInUp}>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Collector's Picks
                </h2>
                <p className="text-zinc-400">
                  Hand-selected premium models for serious collectors.
                </p>
              </motion.div>
              <Link
                to="/products"
                className="hidden md:flex items-center text-zinc-400 hover:text-zinc-100 transition-colors">

                View all <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2 sm:px-0">
              {featuredProducts.map((product) =>
                <ProductCard key={product.id} product={product} />
              )}
            </div>
          </div>
        </section>
      }

      {/* MatchBox */}
      {newArrivals.length > 0 &&
        <section className="py-24 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <motion.div {...fadeInUp}>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  MatchBox
                </h2>
                <p className="text-zinc-400">
                  The latest additions to our garage.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2 sm:px-0">
              {newArrivals.map((product) =>
                <ProductCard key={product.id} product={product} />
              )}
            </div>
          </div>
        </section>
      }

      {/* Value Props */}
      <section className="py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div {...fadeInUp} className="text-center">
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <Star className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">
                Premium Quality
              </h3>
              <p className="text-zinc-400">
                Carefully inspected models ensuring mint condition for your
                collection.
              </p>
            </motion.div>
            <motion.div
              {...fadeInUp}
              className="text-center"
              transition={{
                delay: 0.1
              }}>

              <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">
                Trusted Seller
              </h3>
              <p className="text-zinc-400">
                Passionate collectors serving the community with transparency
                and care.
              </p>
            </motion.div>
            <motion.div
              {...fadeInUp}
              className="text-center"
              transition={{
                delay: 0.2
              }}>

              <div className="w-16 h-16 mx-auto bg-[#25D366]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#25D366]/20">
                <WhatsAppIcon className="w-8 h-8 text-[#25D366]" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">
                Buy on WhatsApp
              </h3>
              <p className="text-zinc-400">
                No complicated checkouts. Enquire and buy directly via WhatsApp.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>);

}