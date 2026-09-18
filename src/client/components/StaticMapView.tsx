import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface StaticMapViewProps {
  address: string;
}

export default function StaticMapView({ address }: StaticMapViewProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const DEFAULT_LAT = 27.7172;
  const DEFAULT_LNG = 85.324;

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || mapRef.current) return;

    (async () => {
      const L = (await import("leaflet")).default;

      let lat = DEFAULT_LAT;
      let lng = DEFAULT_LNG;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        if (data?.[0]) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        }
      } catch {
        // fallback
      }

      if (mapRef.current || (containerRef.current as any)?._leaflet_id) return;

      mapRef.current = L.map(containerRef.current!, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);

      const icon = L.divIcon({
        html: `<div style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4));transform:translateY(-4px)">
          <svg viewBox="0 0 24 24" width="28" height="36" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>`,
        className: "",
        iconSize: [28, 36],
        iconAnchor: [14, 36],
      });

      L.marker([lat, lng], { icon }).addTo(mapRef.current);
      setIsReady(true);
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [address]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-stone-200" style={{ height: "180px" }}>
      <div ref={containerRef} className="w-full h-full" />
      {!isReady && (
        <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}
      {isReady && (
        <a
          href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 bg-white text-xs font-bold text-stone-600 px-2 py-1 rounded-lg shadow border border-stone-200 hover:bg-stone-50 transition-colors z-[1000]"
        >
          Open Map ↗
        </a>
      )}
    </div>
  );
}
