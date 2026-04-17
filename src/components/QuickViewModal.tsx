import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Check, Heart } from 'lucide-react';
import { Product } from '../types';
import { useFirebase } from '../FirebaseContext';
import { useState } from 'react';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart, wishlist, toggleWishlist } = useFirebase();
  const [isAdded, setIsAdded] = useState(false);

  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-ink/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-brand-paper overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-brand-ink hover:bg-brand-ink hover:text-white transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Section */}
            <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto md:h-[600px] overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Details Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-8 right-8 p-3 rounded-full transition-all duration-300 ${
                  isWishlisted ? 'text-brand-accent scale-110' : 'text-brand-ink/20 hover:text-brand-accent hover:scale-110'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <div className="mb-8">
                <span className="text-[11px] uppercase tracking-[0.3em] text-brand-accent font-semibold mb-4 block">
                  {product.category}
                </span>
                <h2 className="text-3xl md:text-4xl font-serif mb-4 leading-tight">
                  {product.name}
                </h2>
                <p className="text-2xl font-serif text-brand-ink/80">
                  ₹{product.price}
                </p>
              </div>

              <div className="space-y-6 mb-10">
                <p className="text-brand-ink/60 text-sm leading-relaxed">
                  {product.description || "Experience the perfect blend of style and comfort with this curated piece from our latest collection. Designed for the modern individual who values both elegance and everyday wearability."}
                </p>
                
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-brand-ink/40">
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    In Stock
                  </span>
                  <span>•</span>
                  <span>Free Shipping</span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`w-full py-5 px-8 flex items-center justify-center gap-3 group transition-all duration-500 uppercase text-[11px] tracking-[0.2em] font-bold ${
                  isAdded ? 'bg-brand-ink text-white' : 'bg-brand-ink text-white hover:bg-brand-accent'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isAdded ? (
                    <motion.div
                      key="added"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Added to Bag
                    </motion.div>
                  ) : (
                    <motion.div
                      key="add"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 transition-transform duration-500 group-hover:-translate-y-0.5" />
                      Add to Bag
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
