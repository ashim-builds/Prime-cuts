import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show splash screen once per session
    const hasSeenSplash = sessionStorage.getItem("has_seen_splash");
    if (!hasSeenSplash) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem("has_seen_splash", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#111111]"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-32 h-32 relative flex items-center justify-center mb-4 filter drop-shadow-2xl">
              <img
                src="/images/logo.png"
                alt="Prime Cuts - Butcher House"
                className="w-full h-full object-contain"
              />
            </div>
            <h1
              className="text-4xl font-black text-white uppercase tracking-tight"
              style={{ fontFamily: "'Anton', 'Archivo Black', system-ui, sans-serif" }}
            >
              PRIME <span className="text-primary">CUTS</span>
            </h1>
            <p className="text-stone-300 text-xs font-bold tracking-[0.25em] mt-1 uppercase">
              — ARTISANAL BUTCHER HOUSE —
            </p>
            <p className="text-primary text-xs font-extrabold tracking-wider mt-2">
              ★ Premium Cuts • Quality You Can Trust ★
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
