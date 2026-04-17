import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 mb-8">
      <Link 
        to="/" 
        className="flex items-center gap-1.5 hover:text-brand-ink transition-colors group"
      >
        <Home className="w-3 h-3 group-hover:scale-110 transition-transform" />
        Home
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-2.5 h-2.5 opacity-40" />
          {item.path ? (
            <Link 
              to={item.path}
              className="hover:text-brand-ink transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-brand-ink">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
