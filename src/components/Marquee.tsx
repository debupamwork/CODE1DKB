import React from 'react';
import { useFirebase } from '../FirebaseContext';

export default function Marquee() {
  const { settings } = useFirebase();
  const items = settings.marqueeItems;

  return (
    <div className="bg-brand-ink py-4 overflow-hidden whitespace-nowrap border-y border-white/10">
      <div className="flex animate-marquee">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center">
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <span className="text-white text-[11px] uppercase tracking-[0.3em] font-bold px-12">
                  {item}
                </span>
                <div className="w-1 h-1 bg-brand-accent rounded-full" />
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
