import { useEffect, useRef, useState, useCallback } from "react";
import { Locate, MapPin, Loader2, Search, X, Navigation, Crosshair, AlertCircle, Check } from "lucide-react";

interface MapPickerProps {
  onAddressSelect: (address: string, coords: { lat: number; lng: number }) => void;
  initialAddress?: string;
  initialCoords?: { lat: number; lng: number } | null;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const POKHARA_LANDMARKS: SearchResult[] = [
  { place_id: 9001, display_name: "Lakeside, Pokhara, Gandaki", lat: "28.2096", lon: "83.9585" },
  { place_id: 9002, display_name: "Mahendrapool, Pokhara, Gandaki", lat: "28.2215", lon: "83.9875" },
  { place_id: 9003, display_name: "Prithvi Chowk, Pokhara, Gandaki", lat: "28.2052", lon: "83.9888" },
  { place_id: 9004, display_name: "Chipledhunga, Pokhara, Gandaki", lat: "28.2201", lon: "83.9845" },
  { place_id: 9005, display_name: "Satmuhane, Lekhnath, Pokhara", lat: "28.1630", lon: "84.0750" },
  { place_id: 9006, display_name: "Talchowk (Lekhnath), Pokhara", lat: "28.1725", lon: "84.0495" },
  { place_id: 9007, display_name: "Bagar, Pokhara, Gandaki", lat: "28.2415", lon: "83.9820" },
  { place_id: 9008, display_name: "Lamachaur, Pokhara, Gandaki", lat: "28.2612", lon: "83.9780" },
  { place_id: 9009, display_name: "Birauta, Pokhara, Gandaki", lat: "28.1880", lon: "83.9710" },
  { place_id: 9010, display_name: "Gharipatan (Airport Area), Pokhara", lat: "28.1920", lon: "83.9770" },
  { place_id: 9011, display_name: "Amar Singh Chowk, Pokhara", lat: "28.2085", lon: "84.0020" },
  { place_id: 9012, display_name: "Rambazar, Pokhara, Gandaki", lat: "28.1960", lon: "83.9950" },
  { place_id: 9013, display_name: "Matepani (Kundahar), Pokhara", lat: "28.2140", lon: "84.0080" },
  { place_id: 9014, display_name: "Naya Bazar, Pokhara, Gandaki", lat: "28.2150", lon: "83.9910" },
  { place_id: 9015, display_name: "Sarangkot, Pokhara, Gandaki", lat: "28.2435", lon: "83.9485" },
  { place_id: 9016, display_name: "Hemja, Pokhara, Gandaki", lat: "28.2750", lon: "83.9280" },
  { place_id: 9017, display_name: "Malepatan, Pokhara, Gandaki", lat: "28.2160", lon: "83.9720" },
  { place_id: 9018, display_name: "Srijana Chowk, Pokhara", lat: "28.2090", lon: "83.9780" },
  { place_id: 9019, display_name: "Rastrabank Chowk, Pokhara", lat: "28.2020", lon: "83.9680" },
];

export default function MapPicker({ onAddressSelect, initialAddress, initialCoords }: MapPickerProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || "");
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(initialCoords || null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [locationError, setLocationError] = useState<{ message: string; showHelp?: boolean } | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  const DEFAULT_LAT = 28.2096; // Pokhara / Nepal default
  const DEFAULT_LNG = 83.9856;
  const DEFAULT_ZOOM = 14;

  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      return addr;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } finally {
      setIsGeocoding(false);
    }
  }

  const updateMarkerAndLocation = useCallback((L: any, lat: number, lng: number, zoomLevel = 17, skipReverseGeocode = false, presetAddress?: string) => {
    if (!mapRef.current) return;

    mapRef.current.setView([lat, lng], zoomLevel);

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        html: `<div style="
          width:36px;height:44px;
          display:flex;align-items:center;justify-content:center;
          filter: drop-shadow(0 3px 8px rgba(0,0,0,0.4));
          transform:translateY(-4px);
        ">
          <svg viewBox="0 0 24 24" width="36" height="44" fill="#cc0411" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>`,
        className: "",
        iconSize: [36, 44],
        iconAnchor: [18, 44],
      });

      markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(mapRef.current);

      markerRef.current.on("dragend", async () => {
        const pos = markerRef.current.getLatLng();
        setCurrentCoords({ lat: pos.lat, lng: pos.lng });
        const addr = await reverseGeocode(pos.lat, pos.lng);
        setSelectedAddress(addr);
        onAddressSelect(addr, { lat: pos.lat, lng: pos.lng });
      });
    }

    setCurrentCoords({ lat, lng });

    if (presetAddress) {
      setSelectedAddress(presetAddress);
      onAddressSelect(presetAddress, { lat, lng });
    } else if (!skipReverseGeocode) {
      reverseGeocode(lat, lng).then((addr) => {
        setSelectedAddress(addr);
        onAddressSelect(addr, { lat, lng });
      });
    }
  }, [onAddressSelect]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || mapRef.current) return;

    (async () => {
      const L = (await import("leaflet")).default;

      if (mapRef.current || (containerRef.current as any)?._leaflet_id) return;

      const initialLat = initialCoords?.lat || DEFAULT_LAT;
      const initialLng = initialCoords?.lng || DEFAULT_LNG;

      mapRef.current = L.map(containerRef.current!, {
        center: [initialLat, initialLng],
        zoom: initialCoords ? 16 : DEFAULT_ZOOM,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);

      if (initialCoords) {
        updateMarkerAndLocation(L, initialCoords.lat, initialCoords.lng, 17, true, initialAddress);
      }

      mapRef.current.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        setLocationError(null);
        setShowDropdown(false);
        updateMarkerAndLocation(L, lat, lng, mapRef.current.getZoom() || 17);
      });

      setIsMapReady(true);
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        accuracyCircleRef.current = null;
      }
    };
  }, []);

  // Search Address autocomplete handler with instant local matches + online fallback
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query.trim() || query.trim().length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    // 1. Instant local landmark matching
    const qLower = query.toLowerCase().trim();
    const localMatches = POKHARA_LANDMARKS.filter((item) =>
      item.display_name.toLowerCase().includes(qLower)
    );

    setSearchResults(localMatches);
    setShowDropdown(true);

    // 2. Debounced online search
    if (query.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + " Nepal")}&countrycodes=np&limit=5`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const combined = [...localMatches];
              for (const d of data) {
                if (!combined.some((c) => c.display_name === d.display_name)) {
                  combined.push(d);
                }
              }
              setSearchResults(combined);
            }
          }
        } catch (err) {
          console.warn("Online search notice:", err);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    }
  };

  const handleSelectSearchResult = async (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setShowDropdown(false);
    setSearchQuery(result.display_name);
    setLocationError(null);

    const L = (await import("leaflet")).default;
    updateMarkerAndLocation(L, lat, lng, 17, true, result.display_name);
  };

  // High Accuracy Geolocation Locator with Intelligent Fallback
  const handleLocate = () => {
    if (typeof window === "undefined") return;
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError({ message: "Geolocation is not supported by your browser. Please search or tap on the map." });
      return;
    }

    setIsLocating(true);

    const onLocationSuccess = async (pos: GeolocationPosition) => {
      try {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const L = (await import("leaflet")).default;

        // Draw accuracy circle if precision radius provided
        if (accuracyCircleRef.current && mapRef.current) {
          mapRef.current.removeLayer(accuracyCircleRef.current);
        }

        if (accuracy && accuracy < 2000 && mapRef.current) {
          accuracyCircleRef.current = L.circle([lat, lng], {
            radius: Math.min(accuracy, 100),
            color: "#cc0411",
            fillColor: "#cc0411",
            fillOpacity: 0.12,
            weight: 1.5,
          }).addTo(mapRef.current);
        }

        updateMarkerAndLocation(L, lat, lng, 17);
        setLocationError(null);
      } catch (err) {
        console.error("Reverse geocoding error:", err);
        setLocationError({ message: "Located coordinates, but failed to fetch address text. You can drag the pin to adjust." });
      } finally {
        setIsLocating(false);
      }
    };

    // First attempt: High Accuracy GPS (12s timeout)
    navigator.geolocation.getCurrentPosition(
      onLocationSuccess,
      (highAccErr) => {
        console.warn("High accuracy GPS failed, falling back to network positioning...", highAccErr);
        // Fallback attempt: Standard network/wifi positioning
        navigator.geolocation.getCurrentPosition(
          onLocationSuccess,
          (fallbackErr) => {
            console.error("Geolocation fallback error:", fallbackErr);
            setIsLocating(false);
            if (fallbackErr.code === fallbackErr.PERMISSION_DENIED) {
              setLocationError({
                message: "Location access denied. Please allow location access in your browser settings, or use the search bar / tap on the map.",
                showHelp: true,
              });
            } else {
              setLocationError({ message: "Could not detect exact GPS signal. Use the search bar above or tap your location on the map." });
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3">
      {/* 1. Search Bar for instant location search */}
      <div className="relative z-[1001]">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            placeholder="Search your area, landmark, or street (e.g. Satmuhane, Lakeside, Naya Bazar)..."
            className="w-full pl-10 pr-10 py-2.5 bg-white rounded-xl border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-stone-900 font-semibold placeholder:text-stone-400 outline-none shadow-xs"
          />
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowDropdown(false);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        {/* Autocomplete Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 max-h-56 overflow-y-auto z-[2000] divide-y divide-stone-100">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelectSearchResult(result)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-stone-50 transition-colors flex items-start gap-2.5 text-xs text-stone-800 font-medium cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="line-clamp-2">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Interactive Map Box */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm isolate" style={{ height: "300px" }}>
        <div ref={containerRef} className="w-full h-full" />

        {/* Action button: Locate Me */}
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
          <button
            type="button"
            onClick={handleLocate}
            disabled={isLocating || !isMapReady}
            title="Locate my exact current location"
            className="flex items-center gap-1.5 bg-white text-stone-900 text-xs font-black px-3 py-2 rounded-xl shadow-lg border border-stone-200 hover:bg-stone-50 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Locate className="w-4 h-4 text-primary" />
            )}
            <span>{isLocating ? "Locating GPS..." : "My Location"}</span>
          </button>
        </div>

        {/* Live Coordinates Pill on map */}
        {currentCoords && (
          <div className="absolute bottom-3 left-3 z-[1000] bg-stone-900/85 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border border-white/15 pointer-events-none flex items-center gap-1.5 shadow-md">
            <Crosshair className="w-3 h-3 text-red-400" />
            <span>{currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}</span>
          </div>
        )}

        {/* Loading Map Overlay */}
        {!isMapReady && (
          <div className="absolute inset-0 bg-stone-100 flex items-center justify-center z-[999]">
            <div className="flex flex-col items-center gap-2 text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm font-bold">Loading Map...</span>
            </div>
          </div>
        )}
      </div>

      {/* Geolocation Error Alert */}
      {locationError && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-800 leading-snug">{locationError.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className="text-amber-500 hover:text-amber-700 font-bold text-sm shrink-0 cursor-pointer leading-none"
          >✕</button>
        </div>
      )}

      {/* Instruction Tip */}
      {!selectedAddress && isMapReady && !locationError && (
        <p className="flex items-center gap-2 text-xs text-stone-500 font-semibold">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          Search above, tap on the map, or click <strong>"My Location"</strong> to pin your delivery address.
        </p>
      )}

      {/* Selected Address Display Card */}
      {selectedAddress && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Selected Delivery Pin</p>
              {currentCoords && (
                <span className="text-[10px] font-mono font-bold text-stone-500">
                  {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
                </span>
              )}
            </div>
            {isGeocoding ? (
              <div className="flex items-center gap-2 text-xs text-stone-500 font-bold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Resolving address...
              </div>
            ) : (
              <p className="text-xs sm:text-sm font-bold text-stone-900 leading-snug break-words">
                {selectedAddress}
              </p>
            )}
            <p className="text-[10px] text-stone-400 font-medium mt-1">
              💡 Tip: You can drag the red pin directly onto your doorstep or building to fine-tune.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
