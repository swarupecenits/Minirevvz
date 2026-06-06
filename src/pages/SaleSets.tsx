import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../lib/store';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';

export function SaleSets() {
  const navigate = useNavigate();
  const { products } = useStore();
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  const saleSets = useMemo(
    () => products.filter((product) => product.category === 'Sale'),
    [products]
  );

  const sortedSaleSets = useMemo(() => {
    const result = [...saleSets];
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return result;
  }, [saleSets, sortBy]);

  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-zinc-100 mb-2">
            Sale Sets
          </h1>
          <p className="text-zinc-400">
            Discover curated sale sets from our premium boxed collections.
          </p>
          <p className="text-zinc-400 mt-2">
            Showing {sortedSaleSets.length} set{sortedSaleSets.length === 1 ? '' : 's'}.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
          <label htmlFor="sale-sort" className="text-zinc-400 text-sm">
            Sort by
          </label>
          <select
            id="sale-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-zinc-300 focus:outline-none text-sm appearance-none cursor-pointer"
          >
            <option value="newest" className="bg-zinc-900">
              Newest First
            </option>
            <option value="price-asc" className="bg-zinc-900">
              Price: Low to High
            </option>
            <option value="price-desc" className="bg-zinc-900">
              Price: High to Low
            </option>
          </select>
        </div>
      </div>

      {sortedSaleSets.length > 0 ? (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSaleSets.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              key={product.id}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-24 glass-panel rounded-2xl">
          <h3 className="text-xl font-display font-semibold text-zinc-300 mb-2">
            No sale sets found
          </h3>
          <p className="text-zinc-500">
            We don&apos;t have any products tagged as sale sets right now.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => navigate('/products')}
          >
            Browse all products
          </Button>
        </div>
      )}
    </div>
  );
}
