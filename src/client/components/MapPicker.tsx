import { useEffect, useRef, useState } from "react";
import { Locate, MapPin, Loader2 } from "lucide-react";

interface MapPickerProps {
  onAddressSelect: (address: string, coords: { lat: number; lng: number }) => void;
  initialAddress?: string;
}

export default function MapPicker({ onAddressSelect, initialAddress }: MapPickerProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || "");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [locationError, setLocationError] = useState<{ message: string; showHelp?: boolean } | null>(null);

  const DEFAULT_LAT = 28.2096;
  const DEFAULT_LNG = 83.9856;
  const DEFAULT_ZOOM = 13;

  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } finally {
      setIsGeocoding(false);
    }
  }

  function updateMarker(L: any, lat: number, lng: number) {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        html: `<div style="
          width:32px;height:40px;
          display:flex;align-items:center;justify-content:center;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));
          transform:translateY(-4px);
        ">
          <svg viewBox="0 0 24 24" width="32" height="40" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>`,
        className: "",
        iconSize: [32, 40],
        iconAnchor: [16, 40],
      });
      markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(mapRef.current);

      markerRef.current.on("dragend", async () => {
        const pos = markerRef.current.getLatLng();
        const address = await reverseGeocode(pos.lat, pos.lng);
        setSelectedAddress(address);
        onAddressSelect(address, { lat: pos.lat, lng: pos.lng });
      });
    }
  }

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || mapRef.current) return;

    (async () => {
      const L = (await import("leaflet")).default;

      if (mapRef.current || (containerRef.current as any)?._leaflet_id) return;

      mapRef.current = L.map(containerRef.current!, {
        center: [DEFAULT_LAT, DEFAULT_LNG],
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);

      mapRef.current.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        setLocationError(null);
        updateMarker(L, lat, lng);
        const address = await reverseGeocode(lat, lng);
        setSelectedAddress(address);
        onAddressSelect(address, { lat, lng });
      });

      setIsMapReady(true);
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleLocate = () => {
    if (typeof window === "undefined") return;
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError({ message: "Geolocation is not supported by your browser. Please tap on the map to pin your address." });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const L = (await import("leaflet")).default;
          mapRef.current?.setView([lat, lng], 17);
          updateMarker(L, lat, lng);
          const address = await reverseGeocode(lat, lng);
          setSelectedAddress(address);
          onAddressSelect(address, { lat, lng });
          setLocationError(null);
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setLocationError({ message: "Located you, but couldn't fetch the address. Try tapping the map instead." });
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError({
            message: "Location access blocked. Check: (1) Browser address bar 🔒 → Site settings → Location → Allow. Then tap on the map to set pin.",
            showHelp: true,
          });
        } else {
          setLocationError({ message: "Could not retrieve location. Please tap the map to pin your address." });
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm isolate" style={{ height: "300px" }}>
        <div ref={containerRef} className="w-full h-full" />

        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleLocate}
            disabled={isLocating || !isMapReady}
            title="Use my current location"
            className="flex items-center gap-2 bg-white text-black text-sm font-bold px-3 py-2 rounded-xl shadow-lg border border-stone-200 hover:bg-stone-50 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Locate className="w-4 h-4 text-primary" />
            )}
            {isLocating ? "Locating..." : "My Location"}
          </button>
        </div>

        {!isMapReady && (
          <div className="absolute inset-0 bg-stone-100 flex items-center justify-center z-[999]">
            <div className="flex flex-col items-center gap-2 text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm font-bold">Loading Map...</span>
            </div>
          </div>
        )}
      </div>

      {locationError && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <span className="text-amber-500 text-base mt-0.5 shrink-0">⚠</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-700 leading-snug">{locationError.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className="text-amber-400 hover:text-amber-600 font-bold text-sm shrink-0 cursor-pointer leading-none"
          >✕</button>
        </div>
      )}

      {!selectedAddress && isMapReady && !locationError && (
        <p className="flex items-center gap-2 text-sm text-stone-400 font-medium">
          <MapPin className="w-4 h-4 shrink-0" />
          Tap on the map or use &quot;My Location&quot; to pin your delivery address
        </p>
      )}

      {selectedAddress && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex items-start gap-3">
          <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Delivery Address</p>
            {isGeocoding ? (
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <Loader2 className="w-3 h-3 animate-spin" /> Getting address...
              </div>
            ) : (
              <p className="text-sm font-bold text-stone-800 leading-snug">{selectedAddress}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
