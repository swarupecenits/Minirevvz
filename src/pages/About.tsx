import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, Globe } from 'lucide-react';
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
          Driven by Passion. <br />
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
          src="https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&q=80&w=1600"
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
    </div>);

}