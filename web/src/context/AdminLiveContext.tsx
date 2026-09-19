import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { AdminStats, Order } from "@/types/types";

interface AdminLiveContextType {
  stats: AdminStats | null;
  recentOrders: Order[];
  newOrderNotification: {
    show: boolean;
    orderNumber: string;
    customerName: string;
    amount: number;
  } | null;
  dismissNotification: () => void;
}

const AdminLiveContext = createContext<AdminLiveContextType | undefined>(undefined);

export function useAdminLive() {
  const context = useContext(AdminLiveContext);
  if (!context) {
    throw new Error("useAdminLive must be used within an AdminLiveProvider");
  }
  return context;
}

const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.start(now);
    osc1.stop(now + 0.4);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.00, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn("Could not play synthesized audio notification:", err);
  }
};

export function AdminLiveProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [newOrderNotification, setNewOrderNotification] = useState<AdminLiveContextType["newOrderNotification"]>(null);
  
  const lastSeenOrderNumber = useRef<string | null>(null);
  const isInitialFetch = useRef<boolean>(true);

  const dismissNotification = () => {
    setNewOrderNotification(null);
  };

  useEffect(() => {
    let active = true;

    async function fetchUpdates() {
      try {
        const res = await fetch("/api/admin/live-updates");
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        if (!res.ok) return;

        const data = await res.json();
        if (!active || !data.success) return;

        setStats(data.stats);
        setRecentOrders(data.recentOrders);

        if (data.recentOrders && data.recentOrders.length > 0) {
          const latestOrder = data.recentOrders[0];
          if (!isInitialFetch.current && lastSeenOrderNumber.current && latestOrder.orderNumber !== lastSeenOrderNumber.current) {
            playNotificationSound();
            setNewOrderNotification({
              show: true,
              orderNumber: latestOrder.orderNumber,
              customerName: latestOrder.customerInfo.name,
              amount: latestOrder.totalAmount,
            });
          }
          lastSeenOrderNumber.current = latestOrder.orderNumber;
        }

        isInitialFetch.current = false;
      } catch (err) {
        console.error("Failed to fetch live admin updates:", err);
      }
    }

    fetchUpdates();
    const interval = setInterval(fetchUpdates, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <AdminLiveContext.Provider value={{ stats, recentOrders, newOrderNotification, dismissNotification }}>
      {children}
    </AdminLiveContext.Provider>
  );
}
