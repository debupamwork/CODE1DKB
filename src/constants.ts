import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Silk Slip Dress',
    price: 240,
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'A timeless silk slip dress with a delicate sheen and elegant drape.',
    isNew: true
  },
  {
    id: '2',
    name: 'Cashmere Oversized Sweater',
    price: 320,
    category: 'Knitwear',
    image: 'https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?auto=format&fit=crop&q=80&w=800',
    description: 'Luxuriously soft cashmere sweater designed for a relaxed, modern silhouette.',
  },
  {
    id: '3',
    name: 'Tailored Wool Coat',
    price: 580,
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=800',
    description: 'Expertly tailored wool coat featuring a structured shoulder and clean lines.',
    isNew: true
  },
  {
    id: '4',
    name: 'Gold Link Necklace',
    price: 150,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
    description: '18k gold-plated link necklace that adds a touch of sophistication to any look.',
  },
  {
    id: '5',
    name: 'Linen Wide-Leg Trousers',
    price: 180,
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800',
    description: 'Breathable linen trousers with a high-waisted fit and elegant wide-leg cut.',
  },
  {
    id: '6',
    name: 'Minimalist Leather Tote',
    price: 420,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
    description: 'Handcrafted Italian leather tote with a spacious interior and sleek finish.',
  }
];

export const CATEGORIES: string[] = ['All', 'Dresses', 'Outerwear', 'Accessories', 'Knitwear'];
