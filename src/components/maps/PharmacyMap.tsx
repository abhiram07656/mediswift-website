import React, { useEffect, useRef } from 'react';
import { Pharmacy } from '../../types';
import { MapPin, Navigation, Clock, Star, Store } from 'lucide-react';

interface PharmacyMapProps {
  userLat: number;
  userLng: number;
  pharmacies: Pharmacy[];
  selectedPharmacyId?: string;
  onSelectPharmacy?: (pharmacy: Pharmacy) => void;
  height?: string;
  showDeliveryRoute?: boolean;
  driverLat?: number;
  driverLng?: number;
}

export const PharmacyMap: React.FC<PharmacyMapProps> = ({
  userLat,
  userLng,
  pharmacies,
  selectedPharmacyId,
  onSelectPharmacy,
  height = '400px',
  showDeliveryRoute = false,
  driverLat,
  driverLng
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Fallback interactive visual map if Leaflet window is loaded or canvas rendering
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let map: any = null;
    const L = (window as any).L;

    if (L) {
      // Clear previous map instance if any
      const container = mapContainerRef.current;
      container.innerHTML = '';
      const mapDiv = document.createElement('div');
      mapDiv.style.width = '100%';
      mapDiv.style.height = '100%';
      container.appendChild(mapDiv);

      map = L.map(mapDiv).setView([userLat, userLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // User Marker Icon
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emerald-400 opacity-75"></span>
            <div class="relative h-6 w-6 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><path d="m12 8 4 8-4-2-4 2 4-8z"/></svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-1 font-sans">
            <div class="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Your Location</div>
            <div class="text-sm font-medium text-slate-800 mt-0.5">Current Delivery Address</div>
          </div>
        `);

      // Pharmacy Markers
      pharmacies.forEach(ph => {
        const isSelected = ph.id === selectedPharmacyId;
        const phIcon = L.divIcon({
          className: 'custom-ph-marker',
          html: `
            <div class="cursor-pointer group flex flex-col items-center">
              <div class="px-2 py-1 rounded-full bg-white shadow-md text-xs font-bold text-slate-800 border ${isSelected ? 'border-emerald-600 ring-2 ring-emerald-400' : 'border-slate-200'} whitespace-nowrap mb-1">
                ${ph.name.split('—')[0]}
              </div>
              <div class="h-8 w-8 rounded-full ${isSelected ? 'bg-emerald-600 text-white shadow-emerald-300' : 'bg-teal-700 text-white shadow-slate-300'} shadow-lg border-2 border-white flex items-center justify-center transform hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4 6 4v14"/><path d="M9 18h6"/><path d="M12 11v4"/></svg>
              </div>
            </div>
          `,
          iconSize: [40, 50],
          iconAnchor: [20, 45]
        });

        const marker = L.marker([ph.lat, ph.lng], { icon: phIcon }).addTo(map);

        marker.bindPopup(`
          <div class="p-2 font-sans max-w-xs">
            <div class="flex items-center gap-2">
              <img src="${ph.logo}" class="w-8 h-8 rounded-md object-cover border border-slate-200" />
              <div>
                <h4 class="font-bold text-slate-800 text-sm leading-tight">${ph.name}</h4>
                <div class="flex items-center gap-1 text-xs text-amber-500 font-medium">
                  ★ ${ph.rating} <span class="text-slate-400">• ${ph.distance_km ?? 1.2} km away</span>
                </div>
              </div>
            </div>
            <p class="text-xs text-slate-500 mt-2">${ph.address}</p>
            <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-emerald-600 font-medium">🚚 ${ph.estimated_delivery_min} min delivery</span>
              <span class="${ph.is_open ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2 py-0.5 rounded font-semibold text-[10px]">
                ${ph.is_open ? 'OPEN NOW' : 'CLOSED'}
              </span>
            </div>
          </div>
        `);

        marker.on('click', () => {
          if (onSelectPharmacy) {
            onSelectPharmacy(ph);
          }
        });
      });

      // Optional Driver tracking marker & route
      if (showDeliveryRoute && driverLat && driverLng) {
        const driverIcon = L.divIcon({
          className: 'custom-driver-marker',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="h-9 w-9 rounded-full bg-cyan-600 text-white shadow-xl border-2 border-white flex items-center justify-center animate-bounce">
                🚚
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        L.marker([driverLat, driverLng], { icon: driverIcon }).addTo(map).bindPopup('Delivery Agent (Ramesh Kumar)');

        // Draw delivery route line
        const routePoints = [
          [pharmacies[0]?.lat || userLat + 0.01, pharmacies[0]?.lng || userLng + 0.01],
          [driverLat, driverLng],
          [userLat, userLng]
        ];
        L.polyline(routePoints, { color: '#059669', weight: 4, dashArray: '8, 8' }).addTo(map);
      }
    }

    return () => {
      if (map) map.remove();
    };
  }, [userLat, userLng, pharmacies, selectedPharmacyId, showDeliveryRoute, driverLat, driverLng]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-soft border border-slate-200" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px] bg-slate-100 flex items-center justify-center">
        {/* Rendered map or fallback visual map */}
        <div className="p-6 text-center text-slate-500">
          <Store className="w-8 h-8 text-emerald-600 mx-auto animate-pulse mb-2" />
          <p className="text-sm font-medium">Loading Interactive Pharmacy Map...</p>
        </div>
      </div>

      {/* Floating Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg shadow-sm border border-slate-200 text-xs font-medium space-y-1.5 hidden sm:block">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-700">Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-700"></span>
          <span className="text-slate-700">Nearby Pharmacies ({pharmacies.length})</span>
        </div>
        {showDeliveryRoute && (
          <div className="flex items-center gap-2">
            <span className="text-sm">🚚</span>
            <span className="text-cyan-700 font-semibold">Driver en route</span>
          </div>
        )}
      </div>
    </div>
  );
};
