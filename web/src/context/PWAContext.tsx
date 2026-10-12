import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  installApp: () => Promise<void>;
  showIOSInstructions: boolean;
  setShowIOSInstructions: (show: boolean) => void;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  installApp: async () => {},
  showIOSInstructions: false,
  setShowIOSInstructions: () => {},
});

export function PWAProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already running as installed standalone app
    const checkIsInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://") ||
        localStorage.getItem("prime_pwa_installed") === "true";
      setIsInstalled(Boolean(isStandalone));
    };

    checkIsInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      try {
        localStorage.setItem("prime_pwa_installed", "true");
      } catch {}
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    // If Android / Desktop Chrome with deferred prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
        try {
          localStorage.setItem("prime_pwa_installed", "true");
        } catch {}
      }
      setDeferredPrompt(null);
      return;
    }

    // Check if iOS Safari
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      // Fallback alert for non-supported browsers
      alert("To install, tap your browser's menu (⋮) and select 'Install App' or 'Add to Home Screen'.");
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        installApp,
        showIOSInstructions,
        setShowIOSInstructions,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  return useContext(PWAContext);
}
