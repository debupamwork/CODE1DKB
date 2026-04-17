import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, onSnapshot, query, addDoc, serverTimestamp, doc, setDoc, getDocs, deleteDoc, where, orderBy } from 'firebase/firestore';
import { Product } from './types';
import { PRODUCTS } from './constants';

interface CartItem extends Product {
  quantity: number;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  customerEmail: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface SiteSettings {
  heroImage: string;
  marqueeItems: string[];
  footer: {
    address: string;
    email: string;
    phone: string;
    instagram: string;
    twitter: string;
    facebook: string;
  };
}

export interface Review {
  id: string;
  productId: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isAuthReady: boolean;
  isAdmin: boolean;
  products: Product[];
  settings: SiteSettings;
  orders: Order[];
  userOrders: Order[];
  addresses: Address[];
  cart: CartItem[];
  wishlist: string[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  toggleWishlist: (productId: string) => void;
  clearCart: () => void;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  placeOrder: (items: any[], total: number, address: any) => Promise<void>;
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  updateAddress: (addressId: string, address: Partial<Address>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  getReviews: (productId: string) => Promise<Review[]>;
  addReview: (productId: string, orderId: string, rating: number, comment: string) => Promise<void>;
  checkReviewEligibility: (productId: string) => { canReview: boolean; orderId?: string };
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  heroImage: '',
  marqueeItems: ["New Arrivals", "Limited Edition", "Sustainable Fashion", "Global Shipping"],
  footer: {
    address: "AS, India Pin : 781019",
    email: "contact@newbuzz.co.in",
    phone: "+91 000 000 0000",
    instagram: "newbuzz_fashion",
    twitter: "newbuzz",
    facebook: "newbuzz"
  }
};

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('newbuzz_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const savedWishlist = localStorage.getItem('newbuzz_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem('newbuzz_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('newbuzz_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsAuthReady(true);
      
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          if (user.email === 'debupam.work@gmail.com') {
            setIsAdmin(true);
            await setDoc(userRef, {
              email: user.email,
              name: user.displayName,
              role: 'admin'
            }, { merge: true });
          } else {
            await setDoc(userRef, {
              email: user.email,
              name: user.displayName,
              role: 'user'
            }, { merge: true });
          }
        } catch (error) {
          console.error("Error setting user profile:", error);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync Products
  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      if (productsData.length === 0 && isAdmin) {
        seedProducts();
      } else {
        setProducts(productsData);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Sync Settings
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as SiteSettings);
      } else if (isAdmin) {
        // Initialize settings if they don't exist
        setDoc(doc(db, 'settings', 'site'), DEFAULT_SETTINGS);
      }
    });
    return () => unsubscribe();
  }, [isAdmin]);

  // Sync Orders (Admin only)
  useEffect(() => {
    if (!isAdmin) {
      setOrders([]);
      return;
    }

    const q = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Sync User Orders
  useEffect(() => {
    if (!user) {
      setUserOrders([]);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setUserOrders(ordersData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [user]);

  // Sync Addresses
  useEffect(() => {
    if (!user) {
      setAddresses([]);
      return;
    }

    const q = query(
      collection(db, 'addresses'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const addressesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Address[];
      setAddresses(addressesData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'addresses');
    });

    return () => unsubscribe();
  }, [user]);

  const seedProducts = async () => {
    for (const product of PRODUCTS) {
      const { id, ...productData } = product;
      await addDoc(collection(db, 'products'), {
        ...productData,
        stock: 10
      });
    }
  };

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-by-user') return;
      console.error("Login Error:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Email Login Error:", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Force profile update in Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        email,
        name,
        role: 'user',
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error("Registration Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const decreaseQuantity = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const toggleWishlist = async (productId: string) => {
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    
    setWishlist(newWishlist);

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { wishlist: newWishlist }, { merge: true });
      } catch (error) {
        console.error("Error updating wishlist in Firestore:", error);
      }
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = async (items: any[], total: number, address: any) => {
    if (!user) throw new Error("Must be logged in to place order");
    
    const orderData = {
      userId: user.uid,
      customerEmail: user.email,
      items,
      totalAmount: total,
      status: 'pending',
      createdAt: serverTimestamp(),
      shippingAddress: address
    };

    try {
      await addDoc(collection(db, 'orders'), orderData);
      clearCart();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  const addAddress = async (address: Omit<Address, 'id' | 'userId'>) => {
    if (!user) throw new Error("Must be logged in");
    try {
      await addDoc(collection(db, 'addresses'), {
        ...address,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'addresses');
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) throw new Error("Must be logged in");
    try {
      await deleteDoc(doc(db, 'addresses', addressId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `addresses/${addressId}`);
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!user) throw new Error("Must be logged in");
    try {
      // Unset others
      for (const addr of addresses) {
        if (addr.isDefault) {
          await setDoc(doc(db, 'addresses', addr.id), { isDefault: false }, { merge: true });
        }
      }
      // Set this one
      await setDoc(doc(db, 'addresses', addressId), { isDefault: true }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `addresses/${addressId}`);
    }
  };

  const updateAddress = async (addressId: string, address: Partial<Address>) => {
    if (!user) throw new Error("Must be logged in");
    try {
      await setDoc(doc(db, 'addresses', addressId), address, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `addresses/${addressId}`);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!isAdmin) throw new Error("Unauthorized");
    try {
      await addDoc(collection(db, 'products'), product);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    if (!isAdmin) throw new Error("Unauthorized");
    try {
      await setDoc(doc(db, 'products', id), product, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!isAdmin) throw new Error("Unauthorized");
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    if (!isAdmin) throw new Error("Unauthorized");
    try {
      await setDoc(doc(db, 'settings', 'site'), newSettings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/site');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!isAdmin) throw new Error("Unauthorized");
    try {
      await setDoc(doc(db, 'orders', orderId), { status }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${orderId}`);
    }
  };

  const getReviews = async (productId: string) => {
    try {
      const q = query(collection(db, 'reviews'), where('productId', '==', productId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'reviews');
      return [];
    }
  };

  const checkReviewEligibility = (productId: string) => {
    if (!user) return { canReview: false };
    
    // Find a delivered order containing this product
    const deliveredOrder = userOrders.find(order => 
      order.status === 'delivered' && 
      order.items.some(item => item.productId === productId)
    );

    return deliveredOrder 
      ? { canReview: true, orderId: deliveredOrder.id } 
      : { canReview: false };
  };

  const addReview = async (productId: string, orderId: string, rating: number, comment: string) => {
    if (!user) throw new Error("Must be logged in to review");
    
    try {
      await addDoc(collection(db, 'reviews'), {
        productId,
        orderId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating,
        comment,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    }
  };

  return (
    <FirebaseContext.Provider value={{ 
      user, 
      loading, 
      isAuthReady, 
      isAdmin, 
      products, 
      settings,
      orders,
      userOrders,
      addresses,
      cart,
      wishlist,
      selectedProduct,
      setSelectedProduct,
      addToCart,
      removeFromCart,
      decreaseQuantity,
      updateCartQuantity,
      toggleWishlist,
      clearCart,
      login, 
      loginWithEmail,
      registerWithEmail,
      logout, 
      placeOrder,
      addAddress,
      deleteAddress,
      setDefaultAddress,
      updateAddress,
      addProduct,
      updateProduct,
      deleteProduct,
      updateSettings,
      updateOrderStatus,
      getReviews,
      addReview,
      checkReviewEligibility
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
