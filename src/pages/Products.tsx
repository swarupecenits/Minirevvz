import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../lib/store';
import { CATEGORIES, Category } from '../lib/constants';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
export function Products() {
  const { products } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All'
  );
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>(
    'newest'
  );
  // Update URL when category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', selectedCategory);
    }
    setSearchParams(searchParams, {
      replace: true
    });
  }, [selectedCategory, searchParams, setSearchParams]);
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (showPremiumOnly) {
      result = result.filter((p) => p.isPremium);
    }
    if (showNewOnly) {
      result = result.filter((p) => p.isNewArrival);
    }
    result.sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      // newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [products, selectedCategory, showPremiumOnly, showNewOnly, sortBy]);
  const FilterSidebar = () =>
  <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
          Categories
        </h3>
        <div className="space-y-2">
          <button
          onClick={() => setSelectedCategory('All')}
          className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === 'All' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}>
          
            All Products
          </button>
          {CATEGORIES.map((cat) =>
        <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}`}>
          
              {cat}
            </button>
        )}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
          Collections
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showPremiumOnly ? 'bg-amber-500 border-amber-500' : 'border-zinc-700 group-hover:border-zinc-500'}`}>
            
              {showPremiumOnly &&
            <div className="w-2.5 h-2.5 bg-zinc-950 rounded-sm" />
            }
            </div>
            <span className="text-zinc-300">Premium Models</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showNewOnly ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700 group-hover:border-zinc-500'}`}>
            
              {showNewOnly &&
            <div className="w-2.5 h-2.5 bg-zinc-950 rounded-sm" />
            }
            </div>
            <span className="text-zinc-300">New Arrivals</span>
          </label>
        </div>
      </div>
    </div>;

  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-zinc-100 mb-2">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h1>
          <p className="text-zinc-400">
            Showing {filteredAndSortedProducts.length} items
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-zinc-300"
            onClick={() => setIsMobileFiltersOpen(true)}>
            
            <Filter className="w-4 h-4" /> Filters
          </button>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-zinc-300 focus:outline-none text-sm appearance-none cursor-pointer">
              
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
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-32">
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile Filters Modal */}
        {isMobileFiltersOpen &&
        <div className="fixed inset-0 z-50 flex md:hidden">
            <div
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileFiltersOpen(false)} />
          
            <div className="relative w-full max-w-xs bg-zinc-900 h-full p-6 overflow-y-auto border-r border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-display font-bold">Filters</h2>
                <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 text-zinc-400 hover:text-white">
                
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar />
              <div className="mt-12">
                <Button
                className="w-full"
                onClick={() => setIsMobileFiltersOpen(false)}>
                
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        }

        {/* Product Grid */}
        <div className="flex-1">
          {filteredAndSortedProducts.length > 0 ?
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
              {filteredAndSortedProducts.map((product) =>
            <motion.div
              layout
              initial={{
                opacity: 0,
                scale: 0.9
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              transition={{
                duration: 0.3
              }}
              key={product.id}>
              
                  <ProductCard product={product} />
                </motion.div>
            )}
            </motion.div> :

          <div className="text-center py-24 glass-panel rounded-2xl">
              <h3 className="text-xl font-display font-semibold text-zinc-300 mb-2">
                No products found
              </h3>
              <p className="text-zinc-500">
                Try adjusting your filters or category selection.
              </p>
              <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setSelectedCategory('All');
                setShowPremiumOnly(false);
                setShowNewOnly(false);
              }}>
              
                Clear Filters
              </Button>
            </div>
          }
        </div>
      </div>
    </div>);

}