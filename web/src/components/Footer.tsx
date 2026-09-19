import { Link } from "react-router-dom";
import { MapPin, Phone, Lock, Clock } from "lucide-react";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.34 2.88 2.88 0 012.31-4.53 2.66 2.66 0 011.04.2v-3.24a5.85 5.85 0 00-1.04-.1 5.92 5.92 0 00-6 5.94 5.91 5.91 0 005.92 5.92 5.9 5.9 0 005.88-5.08V8.6a8.21 8.21 0 004.31 1.22z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#141416] border-t border-[#232326] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 relative flex items-center justify-center">
                <img
                  src="/images/logo.png"
                  alt="Prime Cuts - Butcher House"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-white leading-none">
                  Prime <span className="text-primary">Cuts</span>
                </span>
                <span className="text-[10px] tracking-[0.2em] font-extrabold text-stone-400 uppercase mt-1">
                  Butcher House
                </span>
              </div>
            </div>
            <p className="text-stone-300 max-w-sm mb-5 leading-relaxed text-sm">
              Daily fresh, hygienic, and premium cuts of goat, chicken, buff, pork, artisanal sausages, and prime steaks. 100% sanitary cutting, food-grade packaging, and fast doorstep delivery.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-stone-200 text-xs font-semibold mb-6">
              <span className="text-primary">★</span>
              <span>Premium Cuts • Quality You Can Trust</span>
              <span className="text-primary">★</span>
            </div>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-white transition-colors">
                <span className="sr-only">TikTok</span>
                <TiktokIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Fresh Meat Cuts</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-stone-300 hover:text-white transition-colors">
                  All Fresh Cuts
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-stone-300 hover:text-white transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-stone-300 hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-stone-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-stone-300 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Contact & Hours</h3>
            <ul className="space-y-4 text-stone-300 text-sm font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-stone-300 leading-relaxed">
                  Lekhnath-30, Dhungepatan,<br />
                  Near Pokhara University, Pokhara
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:9865311559" className="text-white hover:text-primary transition-colors font-bold">+977 9865311559</a>
              </li>
              <li className="flex items-start gap-3 border-t border-[#232326] pt-3 mt-3 text-stone-400">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  Daily 7:00 AM – 8:00 PM<br />
                  <span className="text-emerald-400 font-semibold">Open 7 Days a Week</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#232326] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-stone-400">
          <p>&copy; {new Date().getFullYear()} Prime Cuts - Butcher House. All rights reserved.</p>
          <div className="flex space-x-5 mt-4 md:mt-0 items-center">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link to="/admin/login" className="hover:text-primary transition-colors text-stone-500" title="Admin Login">
              <Lock className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
