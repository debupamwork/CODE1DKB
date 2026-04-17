import { useState, useMemo, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import ProductCard from './ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../FirebaseContext';
import { ChevronDown, SlidersHorizontal, Check, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

export default function ProductGrid() {
  const { products } = useFirebase();
  const { categoryName } = useParams();
  const navigate = useNavigate();
  
  const [activeCategory, setActiveCategory] = useState(categoryName || 'All');

  useEffect(() => {
    if (categoryName) {
      setActiveCategory(categoryName);
    } else {
      setActiveCategory('All');
    }
  }, [categoryName]);

  const handleCategoryClick = (category: string) => {
    if (category === 'All') {
      navigate('/');
    } else {
      navigate(`/category/${category}`);
    }
  };

  const [sortBy, setSortBy] = useState('default');
  const [availability, setAvailability] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    setSortBy('default');
    setAvailability('all');
    setPriceRange('all');
    // We don't clear category as per standard UX, but we can if specifically requested.
    // However, resetting sortBy, availability and priceRange is what was asked.
  };

  const hasActiveFilters = sortBy !== 'default' || availability !== 'all' || priceRange !== 'all';

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Availability Filter
    if (availability === 'new') {
      result = result.filter(p => p.isNew);
    } else if (availability === 'stock') {
      result = result.filter(p => (p.stock ?? 0) > 0);
    }

    // Price Range Filter
    if (priceRange === 'under200') {
      result = result.filter(p => p.price < 200);
    } else if (priceRange === '200-400') {
      result = result.filter(p => p.price >= 200 && p.price <= 400);
    } else if (priceRange === 'over400') {
      result = result.filter(p => p.price > 400);
    }

    // Sorting
    switch (sortBy) {
      case 'priceLow':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'nameAZ':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameZA':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return result;
  }, [products, activeCategory, sortBy, availability, priceRange]);

  return (
    <section id="shop" className="max-w-7xl mx-auto px-6 py-32">
      <div className="flex flex-col items-center mb-24 space-y-12">
        <div className="flex flex-col items-center gap-2">
          {activeCategory !== 'All' && (
            <Breadcrumbs items={[{ label: activeCategory }]} />
          )}
          <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-brand-ink/20">The Collection</span>
          <h2 className="text-3xl md:text-5xl font-serif text-brand-ink italic">Curated Essentials</h2>
        </div>
        
        <div className="w-full overflow-x-auto no-scrollbar py-4 -my-4">
          <div className="flex items-center justify-center gap-12 min-w-max px-6">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`group relative text-[11px] uppercase tracking-[0.3em] font-bold transition-all duration-300 ${
                  activeCategory === category ? 'text-brand-ink' : 'text-brand-ink/30 hover:text-brand-ink'
                }`}
              >
                <span className="relative z-10">{category}</span>
                {activeCategory === category ? (
                  <motion.div
                    layoutId="activeFilterLine"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-brand-accent"
                    transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                  />
                ) : (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-brand-accent/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-brand-ink/5 pb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 text-[10px] uppercase tracking-widest font-bold ${
              showFilters ? 'bg-brand-ink text-white border-brand-ink' : 'border-brand-ink/10 text-brand-ink/60 hover:border-brand-ink hover:text-brand-ink'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {(availability !== 'all' || priceRange !== 'all') && (
              <span className="w-4 h-4 rounded-full bg-brand-accent text-white flex items-center justify-center text-[8px]">!</span>
            )}
          </button>

          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-transparent pl-4 pr-10 py-2 border border-brand-ink/10 rounded-full text-[10px] uppercase tracking-widest font-bold text-brand-ink/60 hover:border-brand-ink hover:text-brand-ink transition-all cursor-pointer focus:outline-none"
            >
              <option value="default">Sort: Default</option>
              <option value="priceLow">Price: Low - High</option>
              <option value="priceHigh">Price: High - Low</option>
              <option value="nameAZ">Name: A - Z</option>
              <option value="nameZA">Name: Z - A</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-ink/40 pointer-events-none" />
          </div>

          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:text-brand-ink transition-colors group"
              >
                <X className="w-3 h-3 group-hover:rotate-90 transition-transform duration-300" />
                Clear Filters
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-ink/40">
          Showing {filteredAndSortedProducts.length} Products
        </p>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-brand-ink/[0.02] rounded-3xl border border-brand-ink/5">
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/20">Availability</span>
                <div className="flex flex-wrap gap-3">
                  {['all', 'new', 'stock'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setAvailability(option)}
                      className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${
                        availability === option ? 'bg-brand-ink text-white shadow-lg' : 'bg-white border border-brand-ink/5 text-brand-ink/40 hover:border-brand-ink/20'
                      }`}
                    >
                      {option === 'all' ? 'All Items' : option === 'new' ? 'New Arrivals' : 'In Stock'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/20">Price Range</span>
                <div className="flex flex-wrap gap-3">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'under200', label: 'Under ₹200' },
                    { id: '200-400', label: '₹200 - ₹400' },
                    { id: 'over400', label: 'Over ₹400' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setPriceRange(option.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all ${
                        priceRange === option.id ? 'bg-brand-ink text-white shadow-lg' : 'bg-white border border-brand-ink/5 text-brand-ink/40 hover:border-brand-ink/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
