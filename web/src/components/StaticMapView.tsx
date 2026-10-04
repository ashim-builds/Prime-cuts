import { useEffect, useRef, useState } from "react";
import { Loader2, ExternalLink, MapPin, Navigation } from "lucide-react";

interface StaticMapViewProps {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
}

export default function StaticMapView({ address, latitude, longitude }: StaticMapViewProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );

  const DEFAULT_LAT = 28.2096;
  const DEFAULT_LNG = 83.9856;

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || mapRef.current) return;

    (async () => {
      const L = (await import("leaflet")).default;

      let lat = latitude ?? DEFAULT_LAT;
      let lng = longitude ?? DEFAULT_LNG;

      if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
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
          // fallback to default
        }
      }

      setResolvedCoords({ lat, lng });

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
          <svg viewBox="0 0 24 24" width="30" height="38" fill="#cc0411" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>`,
        className: "",
        iconSize: [30, 38],
        iconAnchor: [15, 38],
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
  }, [address, latitude, longitude]);

  const googleMapsUrl = resolvedCoords
    ? `https://www.google.com/maps/search/?api=1&query=${resolvedCoords.lat},${resolvedCoords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  const googleDirectionsUrl = resolvedCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${resolvedCoords.lat},${resolvedCoords.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden border border-stone-200 shadow-xs group" style={{ height: "190px" }}>
        <div ref={containerRef} className="w-full h-full cursor-pointer" onClick={() => window.open(googleMapsUrl, "_blank")} />
        
        {!isReady && (
          <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {isReady && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-[1000]">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/95 hover:bg-white text-stone-900 text-xs font-black px-2.5 py-1.5 rounded-lg shadow-md border border-stone-200/90 transition-all flex items-center gap-1.5 hover:scale-102 active:scale-98"
              title="Open Exact Pin in Google Maps"
            >
              {/* Google Maps Pin Icon */}
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C7.58 2 4 5.58 4 10C4 16 12 22 12 22C12 22 20 16 20 10C20 5.58 16.42 2 12 2Z" fill="#EA4335"/>
                <circle cx="12" cy="10" r="3.5" fill="#FFFFFF"/>
              </svg>
              <span>Google Maps ↗</span>
            </a>
          </div>
        )}

        {isReady && resolvedCoords && (
          <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-xs text-[10px] font-mono font-bold text-white px-2 py-0.5 rounded-md pointer-events-none z-[1000] border border-white/20">
            {resolvedCoords.lat.toFixed(5)}, {resolvedCoords.lng.toFixed(5)}
          </div>
        )}
      </div>

      {/* Action Buttons: Open Pin in Google Maps & Get Directions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all shadow-2xs hover:border-stone-300 text-center cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span>Locate Pin</span>
        </a>
        <a
          href={googleDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all shadow-2xs text-center cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 text-white shrink-0" />
          <span>Get Directions</span>
        </a>
      </div>
    </div>
  );
}
