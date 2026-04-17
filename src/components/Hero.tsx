import { motion } from 'motion/react';
import { useFirebase } from '../FirebaseContext';

export default function Hero() {
  const { settings } = useFirebase();

  const optimizedHeroImage = settings.heroImage?.includes('unsplash.com') 
    ? `${settings.heroImage}&q=80&w=1600&auto=format`
    : settings.heroImage;

  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-brand-paper">
      {settings.heroImage && (
        <div className="absolute inset-0 z-0 bg-brand-paper">
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            src={optimizedHeroImage}
            alt="Fashion Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            fetchPriority="high"
            loading="eager"
            decoding="sync"
          />
        </div>
      )}

      {/* Hero content placeholder or overlay if needed */}
      <div className="relative z-10 text-center">
        {!settings.heroImage && (
          <div className="w-12 h-12 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin mx-auto" />
        )}
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-[1px] h-12 bg-brand-ink/20" />
      </div>
    </section>
  );
}
