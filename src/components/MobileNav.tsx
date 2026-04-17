import React, { useState } from 'react';
import { Home, LayoutGrid, User, LogOut } from 'lucide-react';
import { useFirebase } from '../FirebaseContext';
import Cart from './Cart';
import { motion, AnimatePresence } from 'motion/react';
import CustomBagIcon from './CustomBagIcon';

export default function MobileNav({ 
  onOpenProfile, 
  onOpenCheckout,
  onOpenCart
}: { 
  onOpenProfile: () => void;
  onOpenCheckout: () => void;
  onOpenCart: () => void;
}) {
  const { user, login, logout, cart } = useFirebase();
  const [activeTab, setActiveTab] = useState('home');

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleTabClick = (tab: string, action?: () => void) => {
    setActiveTab(tab);
    if (action) action();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden">
      <div className="bg-white/95 backdrop-blur-md border-t border-brand-ink/5 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] px-6 py-2.5 pb-8">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button 
            onClick={() => handleTabClick('home', () => window.scrollTo({ top: 0, behavior: 'smooth' }))}
            className="flex flex-col items-center group"
          >
            <div className="p-1 rounded-xl transition-colors">
              <Home 
                className={`w-[22px] h-[22px] transition-all duration-300 ${activeTab === 'home' ? 'text-brand-ink fill-brand-ink' : 'text-[#8E8E93]'}`} 
                strokeWidth={activeTab === 'home' ? 1.5 : 1.2} 
              />
            </div>
            <span className={`text-[10px] transition-colors mt-0.5 ${activeTab === 'home' ? 'text-brand-ink font-bold' : 'text-[#8E8E93]'}`}>Home</span>
          </button>

          <button 
            onClick={() => handleTabClick('category', () => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }))}
            className="flex flex-col items-center group"
          >
            <div className="p-1 rounded-xl transition-colors">
              <LayoutGrid 
                className={`w-[22px] h-[22px] transition-all duration-300 ${activeTab === 'category' ? 'text-brand-ink fill-brand-ink' : 'text-[#8E8E93]'}`} 
                strokeWidth={activeTab === 'category' ? 1.5 : 1.2} 
              />
            </div>
            <span className={`text-[10px] transition-colors mt-0.5 ${activeTab === 'category' ? 'text-brand-ink font-bold' : 'text-[#8E8E93]'}`}>Category</span>
          </button>

          <button 
            onClick={() => handleTabClick('bag', onOpenCart)}
            className="flex flex-col items-center group relative"
          >
            <div className="p-1 rounded-xl transition-colors">
              <CustomBagIcon 
                className={`w-[22px] h-[22px] transition-all duration-300 ${activeTab === 'bag' ? 'text-brand-ink' : 'text-[#8E8E93]'}`}
                strokeWidth={activeTab === 'bag' ? 1.5 : 1.2}
                isFilled={activeTab === 'bag' || cartCount > 0}
                fillOpacity={activeTab === 'bag' ? 1 : 0.3}
              />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-brand-accent text-white text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] transition-colors mt-0.5 ${activeTab === 'bag' ? 'text-brand-ink font-bold' : 'text-[#8E8E93]'}`}>Bag</span>
          </button>

          <button 
            onClick={() => handleTabClick('profile', onOpenProfile)}
            className="flex flex-col items-center group"
          >
            <div className="p-1 rounded-xl transition-colors">
              <svg 
                width="22" 
                height="22" 
                viewBox="0 0 24 24" 
                fill={activeTab === 'profile' ? "currentColor" : "none"} 
                stroke="currentColor" 
                strokeWidth={activeTab === 'profile' ? "1.5" : "1.2"}
                className={`w-[22px] h-[22px] transition-all duration-300 ${activeTab === 'profile' ? 'text-brand-ink' : 'text-[#8E8E93]'}`}
              >
                <path d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21" />
                <circle cx="12" cy="8" r="4" />
              </svg>
            </div>
            <span className={`text-[10px] transition-colors mt-0.5 ${activeTab === 'profile' ? 'text-brand-ink font-bold' : 'text-[#8E8E93]'}`}>Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
