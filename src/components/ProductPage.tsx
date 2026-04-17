import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, ArrowLeft, ChevronRight, Star, Heart, Share2, Check } from 'lucide-react';
import { Product } from '../types';
import { useFirebase, Review } from '../FirebaseContext';
import { useState, useEffect } from 'react';
import Breadcrumbs from './Breadcrumbs';
import { MessageSquare, Send } from 'lucide-react';

interface ProductPageProps {
  product: Product;
  onClose: () => void;
  onOpenCheckout: () => void;
}

export default function ProductPage({ product, onClose, onOpenCheckout }: ProductPageProps) {
  const { addToCart, user, login, wishlist, toggleWishlist, getReviews, addReview, checkReviewEligibility } = useFirebase();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('Natural');
  const [activeImage, setActiveImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewLoading, setIsReviewLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const productImages = product.images || [product.image];
  const isWishlisted = wishlist.includes(product.id);
  const eligibility = checkReviewEligibility(product.id);

  useEffect(() => {
    const fetchReviews = async () => {
      const data = await getReviews(product.id);
      setReviews(data);
      setIsReviewLoading(false);
    };
    fetchReviews();
  }, [product.id, getReviews]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibility.canReview || !eligibility.orderId) return;
    
    setIsSubmittingReview(true);
    try {
      await addReview(product.id, eligibility.orderId, newRating, newComment);
      setNewComment('');
      setNewRating(5);
      // Refresh reviews
      const data = await getReviews(product.id);
      setReviews(data);
    } catch (error) {
      console.error("Failed to add review", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = [
    { name: 'Natural', class: 'bg-[#F5F5DC]' },
    { name: 'Midnight', class: 'bg-[#1A1A1A]' },
    { name: 'Sage', class: 'bg-[#9CAF88]' }
  ];

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleBuyNow = async () => {
    addToCart(product);
    if (!user) {
      await login();
    }
    onOpenCheckout();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: "spring", damping: 30, stiffness: 200 }}
      className="fixed inset-0 z-[400] bg-brand-paper overflow-y-auto"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand-paper/80 backdrop-blur-md border-b border-brand-ink/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="p-2 hover:text-brand-green transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <a href="/" className="text-xl font-bold tracking-tighter uppercase">NewBuzz</a>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => toggleWishlist(product.id)}
              className={`p-2 rounded-full transition-all duration-300 ${
                isWishlisted ? 'text-brand-accent scale-110' : 'hover:text-brand-accent'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 hover:text-brand-accent transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20 pb-40">
        <Breadcrumbs items={[
          { label: product.category, path: `/category/${product.category}` },
          { label: product.name }
        ]} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Image Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 rounded-sm group select-none">
              <motion.div
                className="relative h-full w-full cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  const swipeThreshold = 50;
                  if (info.offset.x < -swipeThreshold && activeImage < productImages.length - 1) {
                    setActiveImage(prev => prev + 1);
                  } else if (info.offset.x > swipeThreshold && activeImage > 0) {
                    setActiveImage(prev => prev - 1);
                  }
                }}
              >
                <AnimatePresence initial={false} mode="wait">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeInOut"
                    }}
                    src={productImages[activeImage]}
                    alt={`${product.name} view ${activeImage + 1}`}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
              </motion.div>

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setActiveImage(prev => Math.max(0, prev - 1))}
                    className={`p-2 rounded-full bg-white/80 backdrop-blur-sm text-brand-ink pointer-events-auto transition-all hover:bg-white shadow-md ${
                      activeImage === 0 ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveImage(prev => Math.min(productImages.length - 1, prev + 1))}
                    className={`p-2 rounded-full bg-white/80 backdrop-blur-sm text-brand-ink pointer-events-auto transition-all hover:bg-white shadow-md ${
                      activeImage === productImages.length - 1 ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Pagination Dots */}
              {productImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {productImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        activeImage === i ? 'bg-brand-ink w-4' : 'bg-brand-ink/20'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Desktop Thumbnails */}
            {productImages.length > 1 && (
              <div className="hidden md:grid grid-cols-4 gap-4">
                {productImages.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-[3/4] overflow-hidden bg-gray-100 rounded-sm border-2 transition-all block ${
                      activeImage === i ? 'border-brand-ink' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-brand-accent">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-brand-ink/40">(24 Reviews)</span>
              </div>
              
              <span className="text-[11px] uppercase tracking-[0.4em] text-brand-accent font-bold mb-4 block">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
                {product.name}
              </h1>
              <p className="text-3xl font-bold tracking-tight text-brand-ink">
                ₹{product.price}
              </p>
            </div>

            {/* Color Selection */}
            <div className="mb-10">
              <h3 className="text-[11px] uppercase tracking-widest font-bold mb-4">Color: {selectedColor}</h3>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-10 h-10 rounded-full border-2 p-1 transition-all ${
                      selectedColor === color.name ? 'border-brand-ink' : 'border-transparent'
                    }`}
                  >
                    <div className={`w-full h-full rounded-full ${color.class}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[11px] uppercase tracking-widest font-bold">Select Size</h3>
                <button className="text-[10px] uppercase tracking-widest text-brand-ink/40 underline hover:text-brand-ink transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 flex items-center justify-center text-[11px] font-bold border transition-all ${
                      selectedSize === size 
                        ? 'bg-brand-ink text-white border-brand-ink' 
                        : 'bg-transparent border-brand-ink/10 hover:border-brand-ink'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Description & Details */}
            <div className="space-y-8 border-t border-brand-ink/5 pt-10">
              <div>
                <h3 className="text-[11px] uppercase tracking-widest font-bold mb-4">Description</h3>
                <p className="text-brand-ink/60 text-sm leading-relaxed font-light">
                  {product.description || "A masterclass in contemporary design, this piece combines architectural silhouettes with the softest premium fabrics. Every detail has been considered, from the reinforced seams to the custom-finished hardware, ensuring a garment that is as durable as it is beautiful."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Composition</h4>
                  <p className="text-[12px] text-brand-ink/60">100% Organic Cotton</p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Care</h4>
                  <p className="text-[12px] text-brand-ink/60">Dry Clean Only</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-32 border-t border-brand-ink/5 pt-20">
          <div className="flex flex-col md:flex-row gap-16">
            <div className="md:w-1/3">
              <h2 className="text-3xl font-serif mb-6 italic">Customer Reviews</h2>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex text-brand-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? 'fill-current' : ''}`} />
                  ))}
                </div>
                <span className="text-sm font-bold uppercase tracking-widest text-brand-ink/40">
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>

              {/* Review Form */}
              {eligibility.canReview ? (
                <div className="bg-brand-paper p-8 border border-brand-accent/20 rounded-2xl">
                  <h3 className="text-[11px] uppercase tracking-widest font-bold mb-6">Write a Review</h3>
                  <form onSubmit={handleAddReview} className="space-y-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 block mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className={`p-1 transition-all ${newRating >= star ? 'text-brand-accent' : 'text-brand-ink/10'}`}
                          >
                            <Star className={`w-6 h-6 ${newRating >= star ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 block mb-2">Your Experience</label>
                      <textarea
                        required
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-transparent border-b border-brand-ink/10 py-3 text-sm focus:border-brand-accent focus:outline-none transition-colors min-h-[100px]"
                        placeholder="Tell us about the fit, quality..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full bg-brand-ink text-white py-4 text-[10px] uppercase tracking-[0.2em] font-bold rounded-md hover:bg-brand-accent transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmittingReview ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Post Review
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-8 bg-brand-ink/[0.02] border border-brand-ink/5 rounded-2xl text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-4 text-brand-ink/20" />
                  <p className="text-[10px] uppercase tracking-widest text-brand-ink/60 leading-relaxed">
                    Only verified customers with delivered orders can leave a review.
                  </p>
                </div>
              )}
            </div>

            <div className="md:w-2/3">
              {isReviewLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-12">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-brand-ink/5 pb-12 last:border-0">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-bold uppercase tracking-widest mb-1">{review.userName}</p>
                          <div className="flex text-brand-accent gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : ''}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.1em] text-brand-ink/30">
                          {review.createdAt?.toDate().toLocaleDateString() || 'Recently'}
                        </span>
                      </div>
                      <p className="text-brand-ink/70 text-sm leading-relaxed max-w-2xl italic">
                        "{review.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border border-dashed border-brand-ink/10 rounded-3xl">
                  <p className="text-brand-ink/40 text-sm italic">No reviews yet. Be the first to share your experience.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-brand-paper/90 backdrop-blur-xl border-t border-brand-ink/5 p-4">
        <div className="max-w-7xl mx-auto flex gap-3">
          <motion.button
            onClick={handleAddToCart}
            disabled={isAdded}
            animate={{
              scale: isAdded ? [1, 0.98, 1.02, 1] : 1,
            }}
            transition={{ duration: 0.4 }}
            className={`flex-1 py-4 px-8 flex items-center justify-center gap-3 group transition-all duration-500 uppercase text-[10px] tracking-[0.2em] font-bold rounded-md ${
              isAdded ? 'bg-brand-ink text-white' : 'bg-brand-green text-white hover:opacity-90'
            }`}
          >
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.div
                  key="added"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                  Added to Bag
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2"
                >
                  Add to Bag
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-transparent border border-brand-green text-brand-green py-4 px-8 flex items-center justify-center gap-3 hover:bg-brand-green hover:text-white transition-all duration-500 uppercase text-[10px] tracking-[0.2em] font-bold rounded-md"
          >
            Buy It Now
          </button>
        </div>
      </div>

      {/* Related Products Section could go here */}
    </motion.div>
  );
}
