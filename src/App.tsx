import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { BRAND_NAME } from './lib/constants';
import { pingSupabase } from './lib/supabase';
// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Lazy-loaded pages - only loaded when needed
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Products = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const SaleSets = lazy(() => import('./pages/SaleSets').then(m => ({ default: m.SaleSets })));
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const ManageProducts = lazy(() => import('./pages/admin/ManageProducts').then(m => ({ default: m.ManageProducts })));
const ProductForm = lazy(() => import('./pages/admin/ProductForm').then(m => ({ default: m.ProductForm })));
const Settings = lazy(() => import('./pages/admin/Settings').then(m => ({ default: m.Settings })));
const OrdersManagement = lazy(() => import('./pages/admin/OrdersManagement').then(m => ({ default: m.OrdersManagement })));

// Loading fallback for route transitions
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// SEO Helper Component
function SEO() {
  const location = useLocation();
  useEffect(() => {
    let title = BRAND_NAME;
    const path = location.pathname;
    if (path.startsWith('/products/')) {
      title = `Product Details | ${BRAND_NAME}`;
    } else if (path === '/products') {
      title = `All Products | ${BRAND_NAME}`;
    } else if (path === '/sale-sets') {
      title = `Sale Sets | ${BRAND_NAME}`;
    } else if (path === '/about') {
      title = `About Us | ${BRAND_NAME}`;
    } else if (path === '/contact') {
      title = `Contact | ${BRAND_NAME}`;
    } else if (path.startsWith('/admin')) {
      title = `Dashboard | ${BRAND_NAME}`;
    } else if (path === '/login') {
      title = `Seller Login | ${BRAND_NAME}`;
    }
    document.title = title;
  }, [location]);
  return null;
}

export function App() {
  useEffect(() => {
    pingSupabase();
  }, []);
  return (
    <StoreProvider>
      <BrowserRouter>
        <SEO />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Storefront */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/sale-sets" element={<SaleSets />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Checkout */}
            <Route path="/checkout/:id" element={<Checkout />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />
              <Route path="orders" element={<OrdersManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </StoreProvider>
  );
}