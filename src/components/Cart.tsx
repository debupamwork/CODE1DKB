import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../FirebaseContext';
import { X, Minus, Plus } from 'lucide-react';
import CustomBagIcon from './CustomBagIcon';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout: () => void;
}

export default function Cart({ isOpen, onClose, onOpenCheckout }: CartProps) {
  const { cart, addToCart, removeFromCart, decreaseQuantity, clearCart, placeOrder, user, login, addresses } = useFirebase();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      login();
      return;
    }

    onOpenCheckout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-ink/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-brand-paper z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-4 md:p-6 border-b border-brand-ink/5 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-serif uppercase tracking-widest">Your Bag ({cart.length})</h2>
              <button onClick={onClose} className="hover:text-brand-accent transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <CustomBagIcon className="w-12 h-12 text-brand-ink/20 mb-4" strokeWidth={1.2} />
                  <p className="text-brand-ink/40 uppercase tracking-widest text-xs md:text-sm">Your bag is empty</p>
                </div>
              ) : (
                <div className="space-y-6 md:space-y-8">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 md:w-24 aspect-[3/4] bg-gray-100 overflow-hidden rounded-lg">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h3 className="text-[12px] md:text-[13px] uppercase tracking-wider font-medium">{item.name}</h3>
                          <p className="text-sm font-bold tracking-tight">₹{item.price}</p>
                        </div>
                        <p className="text-[10px] md:text-[11px] text-brand-ink/40 uppercase tracking-widest mb-3 md:mb-4">{item.category}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-brand-ink/10 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => decreaseQuantity(item.id)}
                              className="p-2 hover:bg-brand-ink/5 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <AnimatePresence mode="wait">
                              <motion.span 
                                key={item.quantity}
                                initial={{ y: 5, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -5, opacity: 0 }}
                                className="text-xs px-3 font-bold min-w-[2rem] text-center block"
                              >
                                {item.quantity}
                              </motion.span>
                            </AnimatePresence>
                            <button 
                              onClick={() => addToCart(item)}
                              className="p-2 hover:bg-brand-ink/5 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-[10px] uppercase tracking-widest text-brand-ink/40 hover:text-brand-ink font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 md:p-6 border-t border-brand-ink/5 bg-white">
                <div className="flex justify-between mb-4 md:mb-6">
                  <span className="text-[10px] md:text-[11px] uppercase tracking-widest font-medium">Subtotal</span>
                  <span className="text-lg md:text-xl font-bold tracking-tight">₹{total}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-brand-ink text-white py-4 md:py-5 text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-accent transition-all duration-500 rounded-xl shadow-lg"
                >
                  {user ? 'Complete Order' : 'Login to Checkout'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
