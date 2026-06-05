import React from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, AlertCircle, MessageCircle } from 'lucide-react';
import { useStore } from '../../lib/store';
import { Badge } from '../../components/ui/Badge';
export function Dashboard() {
  const { products, analytics } = useStore();
  const totalProducts = products.length;
  const soldOutCount = products.filter(
    (p) => p.availability === 'Sold Out'
  ).length;
  const premiumCount = products.filter((p) => p.isPremium).length;
  const totalClicks = Object.values(analytics.whatsappClicks).reduce(
    (a, b) => a + b,
    0
  );
  const recentProducts = [...products].
  sort(
    (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).
  slice(0, 5);
  const StatCard = ({ title, value, icon: Icon, colorClass }: any) =>
  <div className="glass-panel p-6 rounded-2xl flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-400 mb-1">{title}</p>
        <h3 className="text-3xl font-display font-bold text-zinc-100">
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-zinc-100 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-zinc-400">
          Welcome back. Here's what's happening in your store.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          colorClass="bg-blue-500/10 text-blue-400" />
        
        <StatCard
          title="Premium Models"
          value={premiumCount}
          icon={TrendingUp}
          colorClass="bg-amber-500/10 text-amber-400" />
        
        <StatCard
          title="Sold Out"
          value={soldOutCount}
          icon={AlertCircle}
          colorClass="bg-red-500/10 text-red-400" />
        
        <StatCard
          title="WhatsApp Enquiries"
          value={totalClicks}
          icon={MessageCircle}
          colorClass="bg-[#25D366]/10 text-[#25D366]" />
        
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold text-zinc-100">
            Recently Added
          </h2>
          <Link
            to="/admin/products"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-400">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentProducts.map((product) =>
              <tr
                key={product.id}
                className="hover:bg-white/5 transition-colors">
                
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                      src={product.images[0]}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-zinc-800" />
                    
                      <span className="font-medium text-zinc-200 truncate max-w-[200px]">
                        {product.name}
                      </span>
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
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}