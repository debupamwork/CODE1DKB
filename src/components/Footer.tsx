import { Instagram, Twitter, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { useFirebase } from '../FirebaseContext';

export default function Footer() {
  const { settings } = useFirebase();
  const { footer } = settings;

  return (
    <footer className="bg-white text-brand-ink py-24 px-6 border-t border-brand-ink/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-3xl font-serif mb-8 tracking-widest uppercase">NewBuzz</h2>
          <p className="text-brand-ink/60 text-sm max-w-md leading-relaxed mb-8">
            NewBuzz is a minimalist fashion house dedicated to the art of refined dressing. 
            We create timeless pieces that celebrate the beauty of simplicity and the 
            strength of the modern woman.
          </p>
          <div className="flex gap-6">
            <a href={`https://instagram.com/${footer.instagram}`} target="_blank" rel="noreferrer" className="hover:text-brand-accent transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href={`https://twitter.com/${footer.twitter}`} target="_blank" rel="noreferrer" className="hover:text-brand-accent transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href={`https://facebook.com/${footer.facebook}`} target="_blank" rel="noreferrer" className="hover:text-brand-accent transition-colors"><Facebook className="w-5 h-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-8">Contact Us</h4>
          <ul className="space-y-4 text-sm text-brand-ink/60">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 shrink-0 text-brand-accent" />
              <span>{footer.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 shrink-0 text-brand-accent" />
              <a href={`mailto:${footer.email}`} className="hover:text-brand-ink transition-colors">{footer.email}</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 shrink-0 text-brand-accent" />
              <span>{footer.phone}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-8">Newsletter</h4>
          <p className="text-sm text-brand-ink/60 mb-6">
            Join our mailing list for exclusive updates and early access.
          </p>
          <form className="flex border-b border-brand-ink/20 pb-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-brand-ink/30"
            />
            <button type="submit" className="text-[11px] uppercase tracking-widest font-bold hover:text-brand-accent transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-brand-ink/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-brand-ink/40">
        <p>&copy; 2026 NewBuzz. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-brand-ink transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-brand-ink transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
