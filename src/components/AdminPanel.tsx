import React, { useState, useRef } from 'react';
import { useFirebase } from '../FirebaseContext';
import { X, Upload, Plus, Image as ImageIcon, Loader2, AlertCircle, Settings, Package, Trash2, Edit2, Check, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CustomBagIcon from './CustomBagIcon';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdminTab = 'products' | 'orders' | 'settings';

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { 
    products, 
    orders, 
    settings, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateSettings, 
    updateOrderStatus,
    isAdmin 
  } = useFirebase();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    category: 'Dresses',
    image: '',
    description: '',
    stock: 10,
    isNew: true
  });

  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  
  const [marqueeInput, setMarqueeInput] = useState(settings.marqueeItems.join(', '));
  const [footerForm, setFooterForm] = useState(settings.footer);
  
  const productFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) return null;

  const processImage = (file: File, maxWidth = 1200, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          if (dataUrl.length > 1000000) {
            resolve(processImage(file, maxWidth * 0.8, quality * 0.6));
          } else {
            resolve(dataUrl);
          }
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = productFileRef.current?.files?.[0];
    if (!file) {
      alert("Please select a product image");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const base64Image = await processImage(file);
      await addProduct({ ...newProduct, image: base64Image });
      setNewProduct({
        name: '',
        price: 0,
        category: 'Dresses',
        image: '',
        description: '',
        stock: 10,
        isNew: true
      });
      if (productFileRef.current) productFileRef.current.value = '';
    } catch (error: any) {
      setUploadError("Failed to process image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const base64Image = await processImage(file, 1920, 0.8);
      await updateSettings({ heroImage: base64Image });
    } catch (error: any) {
      setUploadError("Failed to update hero image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        marqueeItems: marqueeInput.split(',').map(s => s.trim()).filter(Boolean),
        footer: footerForm
      });
      alert("Settings updated!");
    } catch (error) {
      alert("Failed to update settings");
    }
  };

  const startEditing = (product: any) => {
    setEditingProduct(product.id);
    setEditForm({ ...product });
  };

  const saveProductEdit = async () => {
    if (!editingProduct) return;
    try {
      await updateProduct(editingProduct, editForm);
      setEditingProduct(null);
    } catch (error) {
      alert("Failed to update product");
    }
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
            className="fixed inset-0 bg-brand-ink/40 backdrop-blur-sm z-[80]"
          />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full md:max-w-4xl bg-brand-paper z-[90] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 md:p-8 border-b border-brand-ink/5 flex flex-col md:flex-row md:items-center justify-between bg-brand-paper sticky top-0 z-20 gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <h2 className="text-xl md:text-2xl font-serif uppercase tracking-widest">OMS Admin</h2>
                  <div className="flex bg-brand-ink/5 p-1 rounded-full overflow-x-auto no-scrollbar">
                    {[
                      { id: 'products', icon: Package, label: 'Products' },
                      { id: 'orders', icon: CustomBagIcon, label: 'Orders' },
                      { id: 'settings', icon: Settings, label: 'Settings' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as AdminTab)}
                        className={`flex items-center gap-2 px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap ${
                          activeTab === tab.id 
                            ? 'bg-brand-ink text-white shadow-lg' 
                            : 'text-brand-ink/40 hover:text-brand-ink'
                        }`}
                      >
                        <tab.icon className="w-3 h-3" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={onClose} className="absolute top-4 right-4 md:static hover:text-brand-accent transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8">
              {uploadError && (
                <div className="mb-8 bg-red-50 border border-red-100 p-4 flex items-start gap-3 text-red-600">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold uppercase tracking-widest mb-1">Error</p>
                    <p>{uploadError}</p>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="space-y-12">
                  {/* Add Product Form */}
                  <section className="bg-white p-4 md:p-8 border border-brand-ink/5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                      <Plus className="w-5 h-5 text-brand-accent" />
                      <h3 className="text-[11px] md:text-[12px] uppercase tracking-[0.3em] font-bold">Add New Product</h3>
                    </div>
                    <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest text-brand-ink/50">Name</label>
                        <input
                          type="text"
                          required
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          className="bg-brand-paper/50 border border-brand-ink/5 p-3 text-sm outline-none focus:border-brand-accent"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-brand-ink/50">Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                          className="bg-brand-paper/50 border border-brand-ink/5 p-3 text-sm outline-none focus:border-brand-accent"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-brand-ink/50">Category</label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                          className="bg-brand-paper/50 border border-brand-ink/5 p-3 text-sm outline-none focus:border-brand-accent"
                        >
                          <option>Dresses</option>
                          <option>Outerwear</option>
                          <option>Accessories</option>
                          <option>Knitwear</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-brand-ink/50">Stock</label>
                        <input
                          type="number"
                          required
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                          className="bg-brand-paper/50 border border-brand-ink/5 p-3 text-sm outline-none focus:border-brand-accent"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-brand-ink/50">Image</label>
                        <input
                          type="file"
                          ref={productFileRef}
                          accept="image/*"
                          className="text-[10px]"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={isUploading}
                        className="md:col-span-3 bg-brand-ink text-white py-4 text-[11px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded-xl"
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {isUploading ? 'Processing...' : 'Add Product'}
                      </button>
                    </form>
                  </section>

                  {/* Product List */}
                  <section>
                    <h3 className="text-[11px] md:text-[12px] uppercase tracking-[0.3em] font-bold mb-6">Inventory Management</h3>
                    <div className="space-y-4">
                      {products.map((product) => (
                        <div key={product.id} className="bg-white p-4 border border-brand-ink/5 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 group relative">
                          <div className="w-full sm:w-16 h-48 sm:h-20 bg-brand-paper overflow-hidden rounded-lg shrink-0">
                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {editingProduct === product.id ? (
                              <>
                                <div className="col-span-2">
                                  <label className="text-[8px] uppercase tracking-widest text-brand-ink/40">Name</label>
                                  <input 
                                    className="w-full text-sm font-bold bg-brand-paper p-1 outline-none border border-brand-ink/5"
                                    value={editForm.name}
                                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] uppercase tracking-widest text-brand-ink/40">Price</label>
                                  <input 
                                    type="number"
                                    className="w-full text-sm bg-brand-paper p-1 outline-none border border-brand-ink/5"
                                    value={editForm.price}
                                    onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                                  />
                                </div>
                                <div>
                                  <label className="text-[8px] uppercase tracking-widest text-brand-ink/40">Stock</label>
                                  <input 
                                    type="number"
                                    className="w-full text-sm bg-brand-paper p-1 outline-none border border-brand-ink/5"
                                    value={editForm.stock}
                                    onChange={e => setEditForm({...editForm, stock: Number(e.target.value)})}
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="col-span-2">
                                  <p className="text-sm font-bold">{product.name}</p>
                                  <p className="text-[10px] text-brand-ink/40 uppercase tracking-widest">{product.category}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-brand-ink/40 uppercase tracking-widest mb-1">Price</p>
                                  <p className="text-sm font-serif">₹{product.price}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-brand-ink/40 uppercase tracking-widest mb-1">Stock</p>
                                  <p className={`text-sm font-bold ${product.stock < 5 ? 'text-red-500' : 'text-green-600'}`}>
                                    {product.stock} units
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
 
                          <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity absolute top-4 right-4 sm:static">
                            {editingProduct === product.id ? (
                              <button onClick={saveProductEdit} className="p-2 bg-green-50 rounded-full text-green-600 hover:bg-green-100 transition-colors">
                                <Check className="w-4 h-4" />
                              </button>
                            ) : (
                              <button onClick={() => startEditing(product)} className="p-2 bg-brand-paper rounded-full text-brand-ink hover:text-brand-accent transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => deleteProduct(product.id)} className="p-2 bg-red-50 rounded-full text-red-600 hover:bg-red-100 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-20 text-brand-ink/20">
                      <CustomBagIcon className="w-12 h-12 mx-auto mb-4 opacity-20" strokeWidth={1.2} />
                      <p className="text-[11px] uppercase tracking-widest">No orders yet</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="bg-white border border-brand-ink/5 rounded-2xl overflow-hidden">
                        <div className="p-4 md:p-6 bg-brand-paper/30 flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-ink/5 gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold mb-1">Order #{order.id.slice(-6)}</p>
                            <p className="text-[10px] text-brand-ink/40">{new Date(order.createdAt?.seconds * 1000).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                              className="bg-white border border-brand-ink/10 px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold rounded-lg outline-none focus:border-brand-accent"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <p className="text-sm font-serif font-bold">₹{order.totalAmount}</p>
                          </div>
                        </div>
                        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                          <div className="space-y-4">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Items</p>
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-12 bg-brand-paper rounded overflow-hidden shrink-0">
                                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[11px] font-bold">{item.name}</p>
                                  <p className="text-[10px] text-brand-ink/40">Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-4">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Customer & Shipping</p>
                            <div className="text-[11px] space-y-1">
                              <p className="font-bold">{order.customerEmail}</p>
                              <p className="text-brand-ink/60">{order.shippingAddress.street}</p>
                              <p className="text-brand-ink/60">{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                              <p className="text-brand-ink/60">{order.shippingAddress.country}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-12">
                  {/* Hero Image */}
                  <section className="bg-white p-4 md:p-8 border border-brand-ink/5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                      <ImageIcon className="w-5 h-5 text-brand-accent" />
                      <h3 className="text-[11px] md:text-[12px] uppercase tracking-[0.3em] font-bold">Hero Configuration</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
                      <div className="aspect-video bg-brand-paper rounded-xl overflow-hidden border border-brand-ink/5">
                        <img src={settings.heroImage} alt="Current Hero" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] text-brand-ink/40 leading-relaxed">
                          Upload a high-resolution image (1920x1080 recommended) to replace the current hero background.
                        </p>
                        <div className="relative">
                          <input 
                            type="file" 
                            onChange={handleUpdateHero}
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <button className="w-full bg-brand-ink text-white py-4 text-[11px] uppercase tracking-widest font-bold hover:bg-brand-accent transition-all flex items-center justify-center gap-2 rounded-xl">
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            Change Hero Image
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Marquee Text */}
                  <section className="bg-white p-4 md:p-8 border border-brand-ink/5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                      <Edit2 className="w-5 h-5 text-brand-accent" />
                      <h3 className="text-[11px] md:text-[12px] uppercase tracking-[0.3em] font-bold">Marquee Content</h3>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest text-brand-ink/50">Phrases (comma separated)</label>
                      <textarea
                        value={marqueeInput}
                        onChange={(e) => setMarqueeInput(e.target.value)}
                        className="w-full bg-brand-paper/50 border border-brand-ink/5 p-4 text-sm outline-none focus:border-brand-accent h-24 resize-none rounded-xl"
                        placeholder="New Arrivals, Limited Edition, Sustainable Fashion..."
                      />
                    </div>
                  </section>

                  {/* Footer Details */}
                  <section className="bg-white p-4 md:p-8 border border-brand-ink/5 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                      <Settings className="w-5 h-5 text-brand-accent" />
                      <h3 className="text-[11px] md:text-[12px] uppercase tracking-[0.3em] font-bold">Footer & Contact</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-[10px] uppercase tracking-widest text-brand-ink/50">Address</label>
                        <input
                          type="text"
                          value={footerForm.address}
                          onChange={(e) => setFooterForm({ ...footerForm, address: e.target.value })}
                          className="bg-brand-paper/50 border border-brand-ink/5 p-3 text-sm outline-none focus:border-brand-accent rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-brand-ink/50">Email</label>
                        <input
                          type="email"
                          value={footerForm.email}
                          onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                          className="bg-brand-paper/50 border border-brand-ink/5 p-3 text-sm outline-none focus:border-brand-accent rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-brand-ink/50">Phone</label>
                        <input
                          type="text"
                          value={footerForm.phone}
                          onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })}
                          className="bg-brand-paper/50 border border-brand-ink/5 p-3 text-sm outline-none focus:border-brand-accent rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-brand-ink/50">Instagram</label>
                        <input
                          type="text"
                          value={footerForm.instagram}
                          onChange={(e) => setFooterForm({ ...footerForm, instagram: e.target.value })}
                          className="bg-brand-paper/50 border border-brand-ink/5 p-3 text-sm outline-none focus:border-brand-accent rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-brand-ink/50">Twitter</label>
                        <input
                          type="text"
                          value={footerForm.twitter}
                          onChange={(e) => setFooterForm({ ...footerForm, twitter: e.target.value })}
                          className="bg-brand-paper/50 border border-brand-ink/5 p-3 text-sm outline-none focus:border-brand-accent rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-widest text-brand-ink/50">Facebook</label>
                        <input
                          type="text"
                          value={footerForm.facebook}
                          onChange={(e) => setFooterForm({ ...footerForm, facebook: e.target.value })}
                          className="bg-brand-paper/50 border border-brand-ink/5 p-3 text-sm outline-none focus:border-brand-accent rounded-lg"
                        />
                      </div>
                    </div>
                  </section>

                  <button 
                    onClick={handleSaveSettings}
                    className="w-full bg-brand-ink text-white py-4 md:py-6 text-[11px] md:text-[12px] uppercase tracking-[0.3em] font-bold hover:bg-brand-accent transition-all flex items-center justify-center gap-3 rounded-2xl shadow-xl sticky bottom-0 z-10"
                  >
                    <Save className="w-5 h-5" />
                    Save All Site Settings
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
