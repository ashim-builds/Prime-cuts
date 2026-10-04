import React, { createContext, useContext, useState, useEffect } from "react";

export interface StoreStatusData {
  isOpen: boolean;
  mode: "auto" | "force_open" | "force_closed";
  openTime: string;
  closeTime: string;
  autoScheduleEnabled: boolean;
  closedMessage: string;
  phone: string;
  riderPhone: string;
  freeDeliveryThreshold: number;
  deliveryCharge: number;
  currentNepalTime: string;
  isLoading: boolean;
  refetchStatus: () => Promise<void>;
}

const defaultStatus: StoreStatusData = {
  isOpen: true,
  mode: "auto",
  openTime: "07:00",
  closeTime: "20:00",
  autoScheduleEnabled: true,
  closedMessage: "Our butcher shop is currently closed. Accepting pre-orders for fresh morning delivery!",
  phone: "+9779714324919",
  riderPhone: "+9779714324919",
  freeDeliveryThreshold: 899,
  deliveryCharge: 50,
  currentNepalTime: "07:00",
  isLoading: true,
  refetchStatus: async () => {},
};

const StoreStatusContext = createContext<StoreStatusData>(defaultStatus);

export function useStoreStatus() {
  return useContext(StoreStatusContext);
}

export function StoreStatusProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Omit<StoreStatusData, "isLoading" | "refetchStatus">>({
    isOpen: true,
    mode: "auto",
    openTime: "07:00",
    closeTime: "20:00",
    autoScheduleEnabled: true,
    closedMessage: "Our butcher shop is currently closed. Accepting pre-orders for fresh morning delivery!",
    phone: "+9779714324919",
    riderPhone: "+9779714324919",
    freeDeliveryThreshold: 899,
    deliveryCharge: 50,
    currentNepalTime: "07:00",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/store/status");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData({
            isOpen: Boolean(json.isOpen),
            mode: json.mode || "auto",
            openTime: json.openTime || "07:00",
            closeTime: json.closeTime || "20:00",
            autoScheduleEnabled: Boolean(json.autoScheduleEnabled),
            closedMessage: json.closedMessage || "Our butcher shop is currently closed.",
            phone: json.phone || "+9779714324919",
            riderPhone: json.riderPhone || "+9779714324919",
            freeDeliveryThreshold: Number(json.freeDeliveryThreshold || 899),
            deliveryCharge: Number(json.deliveryCharge || 50),
            currentNepalTime: json.currentNepalTime || "07:00",
          });
        }
      }
    } catch (err) {
      console.warn("[StoreStatus] Failed to fetch live store status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <StoreStatusContext.Provider
      value={{
        ...data,
        isLoading,
        refetchStatus: fetchStatus,
      }}
    >
      {children}
    </StoreStatusContext.Provider>
  );
}
