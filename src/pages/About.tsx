import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, Globe, BookOpen } from 'lucide-react';
export function About() {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="text-center mb-16">
        
        <h1 className="text-4xl md:text-5xl font-display font-bold text-zinc-100 mb-6">
          Minirevvz Store. <br />
          <span className="text-gradient-silver">Curated for Collectors.</span>
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          We are passionate diecast collectors bringing carefully selected Hot
          Wheels, Bburago, CCA, imported models, premiums, and collectible sets
          to fellow enthusiasts.
        </p>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          delay: 0.2
        }}
        className="aspect-video rounded-3xl overflow-hidden mb-16 border border-white/10 relative">
        
        <img
          src="https://res.cloudinary.com/dagggqd6g/image/upload/v1780693910/hero_img_lvkvzk.jpg"
          alt="Diecast Collection"
          className="w-full h-full object-cover" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          className="glass-panel p-8 rounded-2xl text-center">
          
          <Heart className="w-8 h-8 text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold mb-2">
            For Enthusiasts
          </h3>
          <p className="text-zinc-400 text-sm">
            Every model is selected with a collector's eye for detail, rarity,
            and condition.
          </p>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          transition={{
            delay: 0.1
          }}
          className="glass-panel p-8 rounded-2xl text-center">
          
          <Globe className="w-8 h-8 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold mb-2">
            Global Imports
          </h3>
          <p className="text-zinc-400 text-sm">
            We source hard-to-find models and exclusive releases from around the
            world.
          </p>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          transition={{
            delay: 0.2
          }}
          className="glass-panel p-8 rounded-2xl text-center">
          
          <Shield className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-xl font-display font-semibold mb-2">
            Mint Condition
          </h3>
          <p className="text-zinc-400 text-sm">
            We guarantee transparent grading and secure packaging for every
            shipment.
          </p>
        </motion.div>
      </div>

      {/* Collector Guidelines */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        whileInView={{
          opacity: 1,
          y: 0
        }}
        viewport={{
          once: true
        }}
        transition={{
          delay: 0.3
        }}
        className="mt-20 glass-panel p-8 md:p-10 rounded-2xl border border-white/10">
        
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-7 h-7 text-amber-400" />
          <h2 className="text-2xl md:text-3xl font-display font-bold text-zinc-100">
            Collector Guidelines
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 mt-0.5 shrink-0">🔸</span>
            <p className="text-zinc-300">Claim fast, collect smart once a model is taken, it won't return.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 mt-0.5 shrink-0">🔸</span>
            <p className="text-zinc-300">All prices are exclusive of shipping (varies by location).</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 mt-0.5 shrink-0">🔸</span>
            <p className="text-zinc-300">Check card & car condition before confirming your pick.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 mt-0.5 shrink-0">🔸</span>
            <p className="text-zinc-300">Delivering Worldwide </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 mt-0.5 shrink-0">🔸</span>
            <p className="text-zinc-300">Shipping begins after full payment.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 mt-0.5 shrink-0">🔸</span>
            <p className="text-zinc-300">Tracking details will be shared post-dispatch.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 mt-0.5 shrink-0">🔸</span>
            <p className="text-zinc-300">No refunds / no replacements collector standards apply.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 mt-0.5 shrink-0">🔸</span>
            <p className="text-zinc-300">Transit damage or loss is not covered.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 mt-0.5 shrink-0">🔸</span>
            <p className="text-zinc-300">No cancellation once your order is locked in.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 mt-0.5 shrink-0">🔸</span>
            <p className="text-zinc-300">COD not available prepaid only for smooth service.</p>
          </div>
        </div>
      </motion.div>
    </div>);

}