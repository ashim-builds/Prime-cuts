import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, CheckCircle2, Share } from "lucide-react";
import { usePWA } from "../context/PWAContext";

export default function PWAInstallPrompt() {
  const { isInstalled, isInstallable, installApp, showIOSInstructions, setShowIOSInstructions } = usePWA();
  const [showFloatingBanner, setShowFloatingBanner] = useState(false);

  useEffect(() => {
    if (isInstalled) {
      setShowFloatingBanner(false);
      return;
    }

    const dismissedUntil = localStorage.getItem("prime_pwa_dismissed_until");
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    if (isInstallable) {
      const timer = setTimeout(() => setShowFloatingBanner(true), 3500);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    setShowFloatingBanner(false);
    localStorage.setItem(
      "prime_pwa_dismissed_until",
      (Date.now() + 5 * 24 * 60 * 60 * 1000).toString()
    );
  };

  return (
    <>
      {/* 1. Subtle Floating Top Prompt Banner (dismissible) */}
      {showFloatingBanner && !isInstalled && (
        <aside 
          aria-label="Install Mobile App"
          className="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:top-20 z-50 max-w-sm w-auto animate-in fade-in slide-in-from-top-3 duration-300"
        >
          <div className="bg-stone-950/90 backdrop-blur-2xl text-white p-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs leading-tight text-white">
                  Prime Cuts Mobile App
                </h4>
                <p className="text-[10px] text-stone-300 font-medium leading-tight mt-0.5">
                  Install for faster 1-tap orders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={installApp}
                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-[11px] font-black uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
              >
                <Download className="w-3 h-3" />
                <span>Install</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. iOS Safari Add to Home Screen Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center relative border border-stone-100 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-primary flex items-center justify-center mx-auto mb-3 border border-red-100">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-stone-900 mb-1">
              Install on your iPhone
            </h3>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Install Prime Cuts on your iOS home screen in two simple steps:
            </p>
            <div className="space-y-2.5 text-left bg-stone-50 p-3.5 rounded-2xl border border-stone-200 text-xs text-stone-700 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-500 -mt-0.5" /> in Safari.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Scroll down and tap <strong>"Add to Home Screen"</strong> (⊕).
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
