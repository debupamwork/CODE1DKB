import { Settings, User, ShoppingBag } from 'lucide-react';
import { useFirebase } from '../FirebaseContext';
import { useState, useEffect } from 'react';
import AdminPanel from './AdminPanel';
import CustomBagIcon from './CustomBagIcon';
import { Link } from 'react-router-dom';

export default function Header({ 
  onOpenProfile, 
  onOpenCart 
}: { 
  onOpenProfile: () => void;
  onOpenCart: () => void;
}) {
  const { isAdmin, user, cart } = useFirebase();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-brand-paper/90 backdrop-blur-md text-brand-ink shadow-sm h-16' : 'bg-transparent text-white h-20'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-xl font-bold tracking-tighter uppercase">NewBuzz</Link>
            
            <nav className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-bold">
              <a href="#" className="hover:opacity-70 transition-colors">Shop</a>
              <a href="#" className="hover:opacity-70 transition-colors">Collections</a>
              <a href="#" className="hover:opacity-70 transition-colors">Journal</a>
            </nav>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {isAdmin && (
              <button 
                onClick={() => setIsAdminOpen(true)}
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  isScrolled 
                    ? 'bg-brand-ink text-white hover:bg-brand-accent' 
                    : 'bg-white text-brand-ink hover:bg-brand-accent hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </>
  );
}
