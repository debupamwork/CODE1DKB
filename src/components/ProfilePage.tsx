import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Package, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  Plus, 
  Trash2, 
  CheckCircle2,
  Mail,
  Lock,
  Phone,
  ArrowLeft,
  Heart,
  ExternalLink
} from 'lucide-react';
import { useFirebase } from '../FirebaseContext';

interface ProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePage({ isOpen, onClose }: ProfilePageProps) {
  const { 
    user, 
    login, 
    loginWithEmail, 
    registerWithEmail, 
    logout, 
    userOrders, 
    addresses,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    wishlist,
    toggleWishlist,
    products,
    setSelectedProduct
  } = useFirebase();

  const [view, setView] = useState<'login' | 'register' | 'profile'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India'
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerWithEmail(email, password, name);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress({ ...newAddress, isDefault: addresses.length === 0 });
      setShowAddressForm(false);
      setNewAddress({ name: '', phone: '', street: '', city: '', state: '', zip: '', country: 'India' });
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: "spring", damping: 30, stiffness: 200 }}
      className="fixed inset-0 z-[500] bg-brand-paper overflow-y-auto"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-paper/80 backdrop-blur-md border-b border-brand-ink/5">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="p-2 hover:text-brand-green transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-bold uppercase tracking-widest">
            {!user ? (view === 'login' ? 'Login' : 'Create Account') : 'My Profile'}
          </h2>
          <div className="w-9" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 pb-32">
        {!user ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-serif">Welcome to NewBuzz</h1>
              <p className="text-brand-ink/40 text-sm">Sign in to manage your orders and addresses</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md text-xs font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <form onSubmit={view === 'login' ? handleEmailLogin : handleRegister} className="space-y-4">
              {view === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/20" />
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-brand-ink/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-green transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/20" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-brand-ink/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-green transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-ink/20" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-brand-ink/5 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-green transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand-ink text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-brand-green transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-ink/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                <span className="bg-brand-paper px-4 text-brand-ink/20">Or continue with</span>
              </div>
            </div>

            <button 
              onClick={login}
              className="w-full bg-white border border-brand-ink/5 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-[11px] uppercase tracking-widest font-bold">Google Account</span>
            </button>

            <p className="text-center text-[11px] font-bold uppercase tracking-widest text-brand-ink/40">
              {view === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => setView(view === 'login' ? 'register' : 'login')}
                className="text-brand-ink hover:text-brand-green transition-colors"
              >
                {view === 'login' ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* User Info */}
            <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-brand-ink/5">
              <div className="w-20 h-20 rounded-full bg-brand-paper flex items-center justify-center overflow-hidden border border-brand-ink/5">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-brand-ink/20" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-serif">{user.displayName || 'NewBuzz Member'}</h2>
                <p className="text-brand-ink/40 text-xs font-bold uppercase tracking-widest">{user.email}</p>
                <button 
                  onClick={logout}
                  className="mt-2 text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Orders Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Recent Orders
                </h3>
                <span className="text-[10px] text-brand-ink/40 uppercase tracking-widest">{userOrders.length} Orders</span>
              </div>

              <div className="space-y-4">
                {userOrders.length > 0 ? (
                  userOrders.map((order) => (
                    <div key={order.id} className="bg-white p-6 rounded-2xl border border-brand-ink/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Order #{order.id.slice(-6)}</p>
                          <p className="text-xs font-bold mt-1">
                            {new Date(order.createdAt?.seconds * 1000).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex-shrink-0 w-12 h-16 bg-brand-paper rounded-lg overflow-hidden border border-brand-ink/5">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-brand-ink/5">
                        <p className="text-xs font-bold uppercase tracking-widest">Total Amount</p>
                        <p className="text-lg font-serif">₹{order.totalAmount}</p>
                      </div>

                      {order.status === 'shipped' && (
                        <div className="pt-2">
                          <button 
                            onClick={() => window.open('https://www.delhivery.com/track/package/' + order.id.slice(-6), '_blank')}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-paper rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-brand-ink hover:text-white transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Track Package
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-brand-ink/10">
                    <Package className="w-8 h-8 text-brand-ink/10 mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-ink/40">No orders yet</p>
                  </div>
                )}
              </div>
            </section>

            {/* Wishlist Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-brand-accent text-brand-accent" />
                  Your Wishlist
                </h3>
                <span className="text-[10px] text-brand-ink/40 uppercase tracking-widest">{wishlistProducts.length} Items</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {wishlistProducts.length > 0 ? (
                  wishlistProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl border border-brand-ink/5 p-4 group relative">
                      <div 
                        onClick={() => {
                          setSelectedProduct(product);
                          onClose();
                        }}
                        className="aspect-[3/4] bg-brand-paper rounded-lg overflow-hidden mb-3 cursor-pointer"
                      >
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[11px] uppercase tracking-wider font-medium line-clamp-1">{product.name}</h4>
                        <p className="text-xs font-serif text-brand-ink">₹{product.price}</p>
                      </div>
                      <button 
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-md rounded-full text-brand-accent shadow-sm hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-dashed border-brand-ink/10">
                    <Heart className="w-8 h-8 text-brand-ink/10 mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-ink/40">Your wishlist is empty</p>
                  </div>
                )}
              </div>
            </section>

            {/* Addresses Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Saved Addresses
                </h3>
                <button 
                  onClick={() => setShowAddressForm(true)}
                  className="text-[10px] uppercase tracking-widest font-bold text-brand-green flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add New
                </button>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {showAddressForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-2xl border border-brand-green/20 space-y-4 mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Full Name</label>
                            <input 
                              required
                              value={newAddress.name}
                              onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                              className="w-full bg-brand-paper border border-brand-ink/5 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-green"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Phone Number</label>
                            <input 
                              required
                              type="tel"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                              className="w-full bg-brand-paper border border-brand-ink/5 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-green"
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Street Address</label>
                            <input 
                              required
                              value={newAddress.street}
                              onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                              className="w-full bg-brand-paper border border-brand-ink/5 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-green"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">City</label>
                            <input 
                              required
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                              className="w-full bg-brand-paper border border-brand-ink/5 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-green"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">State</label>
                            <input 
                              required
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                              className="w-full bg-brand-paper border border-brand-ink/5 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-green"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">ZIP Code</label>
                            <input 
                              required
                              value={newAddress.zip}
                              onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})}
                              className="w-full bg-brand-paper border border-brand-ink/5 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-green"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Country</label>
                            <input 
                              required
                              value={newAddress.country}
                              onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                              className="w-full bg-brand-paper border border-brand-ink/5 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-green"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button 
                            type="submit"
                            className="flex-1 bg-brand-ink text-white py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold"
                          >
                            Save Address
                          </button>
                          <button 
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="px-6 bg-brand-paper text-brand-ink py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <div key={addr.id} className={`bg-white p-6 rounded-2xl border transition-all ${addr.isDefault ? 'border-brand-green/30' : 'border-brand-ink/5'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{addr.name}</p>
                          <span className="text-[10px] text-brand-ink/40 font-bold">{addr.phone}</span>
                          {addr.isDefault && (
                            <span className="bg-brand-green/10 text-brand-green text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!addr.isDefault && (
                            <button 
                              onClick={() => setDefaultAddress(addr.id)}
                              className="p-2 hover:bg-brand-paper rounded-lg transition-colors text-brand-ink/40 hover:text-brand-green"
                              title="Set as Default"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteAddress(addr.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-brand-ink/40 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-brand-ink/60 leading-relaxed">
                        {addr.street}<br />
                        {addr.city}, {addr.state} {addr.zip}<br />
                        {addr.country}
                      </p>
                    </div>
                  ))
                ) : (
                  !showAddressForm && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-brand-ink/10">
                      <MapPin className="w-8 h-8 text-brand-ink/10 mx-auto mb-4" />
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-ink/40">No addresses saved</p>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </motion.div>
  );
}
