import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Eye, Check, Heart } from 'lucide-react';
import { useFirebase } from '../FirebaseContext';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setSelectedProduct, wishlist, toggleWishlist } = useFirebase();
  const [isAdded, setIsAdded] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  const handleProductClick = () => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group">
      <div 
        onClick={handleProductClick}
        className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-6 transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-hover:-translate-y-1 cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {product.isNew && (
          <span className="absolute top-4 left-4 bg-brand-ink text-white text-[9px] uppercase tracking-widest px-3 py-1">
            New
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${
            isWishlisted 
              ? 'bg-brand-accent text-white scale-110' 
              : 'bg-white/80 text-brand-ink hover:scale-110 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md text-brand-ink px-4 md:px-6 py-2 md:py-3 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold opacity-0 scale-90 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100 hover:bg-brand-ink hover:text-white flex items-center gap-2 shadow-2xl whitespace-nowrap"
        >
          <Eye className="w-3 md:w-3.5 h-3 md:h-3.5" />
          <span className="hidden xs:inline">Quick View</span>
          <span className="xs:hidden">View</span>
        </div>

        <motion.button 
          onClick={handleAddToCart}
          disabled={isAdded}
          initial={false}
          animate={{
            scale: isAdded ? [1, 0.9, 1.05, 1] : 1,
            backgroundColor: isAdded ? '#1A1A1A' : '#FFFFFF',
          }}
          transition={{ duration: 0.4 }}
          className={`absolute bottom-4 md:bottom-6 right-4 md:right-6 w-10 md:w-12 h-10 md:h-12 rounded-full flex items-center justify-center shadow-xl z-20 ${
            isAdded 
              ? 'text-white' 
              : 'text-brand-ink opacity-0 translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 hover:bg-brand-ink hover:text-white transition-all duration-300'
          }`}
        >
          <AnimatePresence mode="wait">
            {isAdded ? (
              <motion.div
                key="check"
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
              >
                <Check className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className="flex justify-between items-start mt-4">
        <div onClick={handleProductClick} className="cursor-pointer max-w-[70%]">
          <h3 className="text-[11px] md:text-[13px] uppercase tracking-wider mb-1 font-medium group-hover:text-brand-accent transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[9px] md:text-[11px] text-brand-ink/50 uppercase tracking-widest">
            {product.category}
          </p>
        </div>
        <p className="text-[12px] md:text-[14px] font-bold tracking-tight">
          ₹{product.price}
        </p>
      </div>
    </div>
  );
}
