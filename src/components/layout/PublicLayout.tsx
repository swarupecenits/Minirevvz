import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { BRAND_NAME } from '../../lib/constants';
import { useStore } from '../../lib/store';
import { MessageCircle, Menu, X, Instagram, Mail, MapPin } from 'lucide-react';
import { buildWhatsAppUrl } from '../../lib/whatsapp';
export function PublicLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { settings } = useStore();
  const location = useLocation();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const navItems = [
  {
    label: 'Home',
    path: '/'
  },
  {
    label: 'All Products',
    path: '/products'
  },
  {
    label: 'Premiums',
    path: '/products?category=Premiums'
  },
  {
    label: 'About',
    path: '/about'
  },
  {
    label: 'Contact',
    path: '/contact'
  }];

  const handleFloatingWhatsApp = () => {
    const url = buildWhatsAppUrl(
      settings.whatsappNumber,
      "Hi, I'm visiting your website and have a general inquiry."
    );
    window.open(url, '_blank');
  };
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Sticky Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-zinc-950/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-display font-bold tracking-tighter text-zinc-100 flex items-center gap-2">
            
            <span className="text-gradient-silver">{BRAND_NAME}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) =>
            <Link
              key={item.label}
              to={item.path}
              className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">
              
                {item.label}
              </Link>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-zinc-100 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen &&
      <div className="fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-xl pt-24 px-6 flex flex-col gap-6 md:hidden">
          {navItems.map((item) =>
        <Link
          key={item.label}
          to={item.path}
          className="text-2xl font-display font-medium text-zinc-100">
          
              {item.label}
            </Link>
        )}
        </div>
      }

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-zinc-950 pt-16 pb-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link
                to="/"
                className="text-2xl font-display font-bold tracking-tighter text-zinc-100 mb-4 block">
                
                {BRAND_NAME}
              </Link>
              <p className="text-zinc-400 max-w-sm">
                Premium diecast collectibles, delivered to true car enthusiasts.
                Explore our curated collection of imported models and exclusive
                sets.
              </p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-zinc-100 mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {navItems.map((item) =>
                <li key={item.label}>
                    <Link
                    to={item.path}
                    className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm">
                    
                      {item.label}
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-display font-semibold text-zinc-100 mb-4">
                Contact
              </h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {settings.location}
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {settings.email}
                </li>
                <li className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" /> {settings.instagram}
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <p>
              © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
            </p>
            <Link to="/login" className="hover:text-zinc-300 transition-colors">
              Seller Login
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <button
        onClick={handleFloatingWhatsApp}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] hover:-translate-y-1 transition-all duration-300 group"
        aria-label="Contact on WhatsApp">
        
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-zinc-900 text-zinc-100 text-sm py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
          Chat with us
        </span>
      </button>
    </div>);

}