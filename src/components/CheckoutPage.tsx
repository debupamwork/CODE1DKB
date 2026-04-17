import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Plus,
  ShieldCheck,
  Truck,
  Navigation,
  Loader2,
  Phone,
  User as UserIcon,
  Globe
} from 'lucide-react';
import { useFirebase, Address } from '../FirebaseContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icon issue
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface CheckoutPageProps {
  isOpen: boolean;
  onClose: () => void;
}

function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function CheckoutPage({ isOpen, onClose }: CheckoutPageProps) {
  const { 
    user, 
    cart, 
    addresses, 
    placeOrder, 
    addAddress,
    updateAddress
  } = useFirebase();

  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find(a => a.isDefault)?.id || addresses[0]?.id || ''
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // New Address Form State
  const [newAddress, setNewAddress] = useState({
    name: user?.displayName || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    isDefault: false
  });

  const [mapPosition, setMapPosition] = useState<[number, number]>([20.5937, 78.9629]); // India center

  const geocodeAddress = async (address: any) => {
    const query = `${address.street}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}`;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setMapPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setSelectedAddressId(addr.id);
    setNewAddress({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      isDefault: addr.isDefault
    });
    setShowNewAddressForm(true);
    geocodeAddress(addr);
  };

  const handleAddNewClick = () => {
    setEditingAddressId(null);
    setNewAddress({
      name: user?.displayName || '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'India',
      isDefault: false
    });
    setShowNewAddressForm(true);
    setMapPosition([20.5937, 78.9629]);
  };

  // Calculate total locally
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total > 2000 ? 0 : 150;
  const finalTotal = total + shipping;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapPosition([latitude, longitude]);
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const addr = data.address;
          
          setNewAddress(prev => ({
            ...prev,
            street: addr.road || addr.suburb || addr.neighbourhood || '',
            city: addr.city || addr.town || addr.village || '',
            state: addr.state || '',
            zip: addr.postcode || '',
            country: addr.country || 'India'
          }));
        } catch (error) {
          console.error("Reverse geocoding error:", error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location");
        setIsLocating(false);
      }
    );
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, newAddress);
      } else {
        await addAddress(newAddress);
      }
      setShowNewAddressForm(false);
      setEditingAddressId(null);
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    const address = addresses.find(a => a.id === selectedAddressId);
    if (!address) {
      alert("Please select or add a shipping address");
      return;
    }

    setIsProcessing(true);
    try {
      const shippingAddress = {
        name: address.name,
        phone: address.phone,
        street: address.street,
        city: address.city,
        state: address.state,
        zip: address.zip,
        country: address.country
      };
      
      await placeOrder(cart, finalTotal, shippingAddress);
      setStep('success');
    } catch (error) {
      console.error("Order error:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: "spring", damping: 30, stiffness: 200 }}
      className="fixed inset-0 z-[600] bg-brand-paper overflow-y-auto"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-paper/80 backdrop-blur-md border-b border-brand-ink/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="p-2 hover:text-brand-green transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-bold uppercase tracking-widest">
            {step === 'success' ? 'Order Confirmed' : 'Checkout'}
          </h2>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {step === 'success' ? (
          <div className="text-center space-y-6 py-20">
            <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-brand-green" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-serif">Thank you for your order!</h1>
              <p className="text-brand-ink/40 text-sm">We've sent a confirmation email to {user?.email}</p>
            </div>
            <button 
              onClick={onClose}
              className="bg-brand-ink text-white px-12 py-4 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-brand-green transition-all"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Steps */}
            <div className="lg:col-span-7 space-y-8">
              {/* Step 1: Shipping Address */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-ink text-white flex items-center justify-center text-xs font-bold">1</div>
                    <h3 className="text-[11px] uppercase tracking-widest font-bold">Shipping Address</h3>
                  </div>
                  {!showNewAddressForm && (
                    <button 
                      onClick={handleAddNewClick}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-green hover:text-brand-ink transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add New
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {showNewAddressForm ? (
                    <motion.div
                      key="new-address-form"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white rounded-2xl border border-brand-ink/5 p-6 space-y-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">
                          {editingAddressId ? 'Edit Address Details' : 'New Address Details'}
                        </h4>
                        <button 
                          onClick={() => {
                            setShowNewAddressForm(false);
                            setEditingAddressId(null);
                          }}
                          className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 hover:text-brand-ink"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="space-y-4">
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          disabled={isLocating}
                          className="w-full flex items-center justify-center gap-3 py-4 border-2 border-dashed border-brand-green/20 rounded-xl text-brand-green hover:bg-brand-green/5 transition-all group"
                        >
                          {isLocating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Navigation className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
                          )}
                          <span className="text-[10px] uppercase tracking-widest font-bold">Use Current Location</span>
                        </button>

                        <div className="h-48 rounded-xl overflow-hidden border border-brand-ink/5 z-0">
                          <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                          </MapContainer>
                        </div>

                        <form onSubmit={handleAddNewAddress} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/40 ml-1">Full Name</label>
                              <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-ink/20" />
                                <input
                                  required
                                  type="text"
                                  value={newAddress.name}
                                  onChange={e => setNewAddress({...newAddress, name: e.target.value})}
                                  className="w-full pl-10 pr-4 py-3 bg-brand-paper/50 border border-brand-ink/5 rounded-xl text-xs focus:outline-none focus:border-brand-green transition-colors"
                                  placeholder="Recipient Name"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/40 ml-1">Contact Number</label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-ink/20" />
                                <input
                                  required
                                  type="tel"
                                  value={newAddress.phone}
                                  onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                                  className="w-full pl-10 pr-4 py-3 bg-brand-paper/50 border border-brand-ink/5 rounded-xl text-xs focus:outline-none focus:border-brand-green transition-colors"
                                  placeholder="+91 00000 00000"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-widest font-bold text-brand-ink/40 ml-1">Street Address</label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-ink/20" />
                              <input
                                required
                                type="text"
                                value={newAddress.street}
                                onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-brand-paper/50 border border-brand-ink/5 rounded-xl text-xs focus:outline-none focus:border-brand-green transition-colors"
                                placeholder="House No, Building, Street"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <input
                              required
                              type="text"
                              value={newAddress.city}
                              onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                              className="w-full px-4 py-3 bg-brand-paper/50 border border-brand-ink/5 rounded-xl text-xs focus:outline-none focus:border-brand-green transition-colors"
                              placeholder="City"
                            />
                            <input
                              required
                              type="text"
                              value={newAddress.state}
                              onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                              className="w-full px-4 py-3 bg-brand-paper/50 border border-brand-ink/5 rounded-xl text-xs focus:outline-none focus:border-brand-green transition-colors"
                              placeholder="State"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <input
                              required
                              type="text"
                              value={newAddress.zip}
                              onChange={e => setNewAddress({...newAddress, zip: e.target.value})}
                              className="w-full px-4 py-3 bg-brand-paper/50 border border-brand-ink/5 rounded-xl text-xs focus:outline-none focus:border-brand-green transition-colors"
                              placeholder="Pincode"
                            />
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-ink/20" />
                              <input
                                required
                                type="text"
                                value={newAddress.country}
                                onChange={e => setNewAddress({...newAddress, country: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-brand-paper/50 border border-brand-ink/5 rounded-xl text-xs focus:outline-none focus:border-brand-green transition-colors"
                                placeholder="Country"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-brand-green text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:opacity-90 transition-all disabled:opacity-50"
                          >
                            {isProcessing ? 'Saving...' : editingAddressId ? 'Update and Use This Address' : 'Save and Use This Address'}
                          </button>
                        </form>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="address-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {addresses.length > 0 ? (
                        addresses.map((addr) => (
                          <button
                            key={addr.id}
                            onClick={() => handleEditAddress(addr)}
                            className={`w-full text-left p-6 rounded-2xl border transition-all ${
                              selectedAddressId === addr.id 
                                ? 'border-brand-green bg-brand-green/5' 
                                : 'border-brand-ink/5 bg-white hover:border-brand-ink/20'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedAddressId === addr.id ? 'bg-brand-green text-white' : 'bg-brand-paper text-brand-ink/40'}`}>
                                  <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-bold text-sm mb-1">{addr.name}</p>
                                  <p className="text-[11px] text-brand-ink/40 font-bold mb-2">{addr.phone}</p>
                                  <p className="text-xs text-brand-ink/60 leading-relaxed">
                                    {addr.street}, {addr.city}<br />
                                    {addr.state} {addr.zip}, {addr.country}
                                  </p>
                                </div>
                              </div>
                              {selectedAddressId === addr.id && (
                                <CheckCircle2 className="w-5 h-5 text-brand-green" />
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-brand-ink/10">
                          <MapPin className="w-8 h-8 text-brand-ink/10 mx-auto mb-4" />
                          <p className="text-xs font-bold uppercase tracking-widest text-brand-ink/40 mb-4">No addresses saved</p>
                          <button 
                            onClick={() => setShowNewAddressForm(true)}
                            className="text-[10px] uppercase tracking-widest font-bold text-brand-green underline"
                          >
                            Add your first address
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Step 2: Payment Method */}
              <section className="space-y-6 opacity-50 pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-paper border border-brand-ink/10 text-brand-ink/40 flex items-center justify-center text-xs font-bold">2</div>
                  <h3 className="text-[11px] uppercase tracking-widest font-bold">Payment Method</h3>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-brand-ink/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-brand-ink/20" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Cash on Delivery</p>
                      <p className="text-[10px] text-brand-ink/40 uppercase tracking-widest">Pay when you receive</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-brand-green" />
                </div>
              </section>

              <div className="pt-6">
                <div className="flex items-center gap-2 text-[10px] text-brand-ink/40 uppercase tracking-widest font-bold mb-4">
                  <ShieldCheck className="w-4 h-4" />
                  Secure Checkout
                </div>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddressId || isProcessing || showNewAddressForm}
                  className="w-full bg-brand-ink text-white py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-brand-green transition-all disabled:opacity-50 shadow-xl"
                >
                  {isProcessing ? 'Processing Order...' : `Place Order • ₹${finalTotal}`}
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-brand-ink/5 p-8 sticky top-24">
                <h3 className="text-[11px] uppercase tracking-widest font-bold mb-8">Order Summary</h3>
                
                <div className="space-y-6 mb-8">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 aspect-[3/4] bg-brand-paper rounded-lg overflow-hidden border border-brand-ink/5">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="text-xs font-bold uppercase tracking-tight">{item.name}</p>
                          <p className="text-xs font-bold tracking-tight">₹{item.price * item.quantity}</p>
                        </div>
                        <p className="text-[10px] text-brand-ink/40 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-8 border-t border-brand-ink/5">
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-ink/40 uppercase tracking-widest font-bold">Subtotal</span>
                    <span className="font-bold tracking-tight">₹{total}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-brand-ink/40 uppercase tracking-widest font-bold">Shipping</span>
                    <span className="font-bold tracking-tight">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-brand-ink/5">
                    <span className="text-[11px] uppercase tracking-widest font-bold">Total</span>
                    <span className="text-2xl font-bold tracking-tighter">₹{finalTotal}</span>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-brand-paper rounded-xl space-y-3">
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-brand-ink/60">
                    <Truck className="w-4 h-4" />
                    Estimated Delivery: 3-5 Days
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </motion.div>
  );
}
