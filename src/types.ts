export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  description: string;
  isNew?: boolean;
  stock?: number;
}

export type Category = 'All' | 'Dresses' | 'Outerwear' | 'Accessories' | 'Knitwear';
