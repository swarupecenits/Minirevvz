import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useStore } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
export function ManageProducts() {
  const { products, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const filteredProducts = products.filter(
    (p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-100 mb-2">
            Manage Products
          </h1>
          <p className="text-zinc-400">{products.length} total products</p>
        </div>
        <Link to="/admin/products/new">
          <Button>
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500" />
            
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((product) =>
              <tr
                key={product.id}
                className="hover:bg-white/5 transition-colors group">
                
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                      src={product.images[0]}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover bg-zinc-800" />
                    
                      <div>
                        <div className="font-medium text-zinc-200 line-clamp-1">
                          {product.name}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {product.brand}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-zinc-200">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
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
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/admin/products/edit/${product.id}`}>
                        <button className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors rounded-lg hover:bg-white/10">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/10">
                      
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {filteredProducts.length === 0 &&
              <tr>
                  <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-zinc-500">
                  
                    No products found matching your search.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}