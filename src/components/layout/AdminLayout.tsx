import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X } from
'lucide-react';
import { useStore } from '../../lib/store';
import { BRAND_NAME } from '../../lib/constants';
export function AdminLayout() {
  const { seller, logout } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  if (!seller) {
    return <Navigate to="/login" replace />;
  }
  const navItems = [
  {
    icon: LayoutDashboard,
    label: 'Overview',
    path: '/admin'
  },
  {
    icon: Package,
    label: 'Manage Products',
    path: '/admin/products'
  },
  {
    icon: PlusCircle,
    label: 'Add Product',
    path: '/admin/products/new'
  },
  {
    icon: Settings,
    label: 'Settings',
    path: '/admin/settings'
  }];

  const SidebarContent = () =>
  <>
      <div className="p-6 border-b border-white/10">
        <Link
        to="/"
        className="text-xl font-display font-bold text-zinc-100 flex items-center gap-2">
        
          <span className="text-gradient-silver">{BRAND_NAME}</span>
        </Link>
        <div className="mt-2 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
          Seller Dashboard
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-white font-medium' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}>
            
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>);

      })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="px-4 py-3 mb-2 text-sm text-zinc-400 truncate">
          {seller.email}
        </div>
        <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
        
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>;

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-zinc-900/50">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md z-40 flex items-center justify-between px-4">
        <span className="font-display font-bold text-zinc-100">
          {BRAND_NAME} Admin
        </span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-zinc-100 p-2">
          
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen &&
      <div className="md:hidden fixed inset-0 z-30 pt-16 bg-zinc-950 flex flex-col">
          <SidebarContent />
        </div>
      }

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>);

}