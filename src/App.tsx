/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import Cart from './components/Cart';
import ProductPage from './components/ProductPage';
import ProfilePage from './components/ProfilePage';
import CheckoutPage from './components/CheckoutPage';
import { FirebaseProvider, useFirebase } from './FirebaseContext';
import { AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const { selectedProduct, setSelectedProduct } = useFirebase();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen selection:bg-brand-accent selection:text-white">
      <ScrollToTop />
      <Header 
        onOpenProfile={() => setIsProfileOpen(true)} 
        onOpenCart={() => setIsCartOpen(true)}
      />
      
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Marquee />
              <ProductGrid />
            </>
          } />
          <Route path="/category/:categoryName" element={
            <div className="pt-20">
              <ProductGrid />
            </div>
          } />
        </Routes>
      </main>

      <Footer />
      <MobileNav 
        onOpenProfile={() => setIsProfileOpen(true)} 
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Full screen product page */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductPage 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* Profile Page */}
      <AnimatePresence>
        {isProfileOpen && (
          <ProfilePage 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Checkout Page */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutPage 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </FirebaseProvider>
  );
}
