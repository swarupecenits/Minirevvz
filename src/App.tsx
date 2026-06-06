import React, { useEffect, Component } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { BRAND_NAME } from './lib/constants';
import { pingSupabase } from './lib/supabase';
// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
// Public Pages
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { SaleSets } from './pages/SaleSets';
// Auth & Admin Pages
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { ManageProducts } from './pages/admin/ManageProducts';
import { ProductForm } from './pages/admin/ProductForm';
import { Settings } from './pages/admin/Settings';
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

          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>);

}