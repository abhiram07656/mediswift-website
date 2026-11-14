import React, { useState, useEffect } from 'react';
import { Pharmacy } from '../types';
import { api } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { PharmacyMap } from '../components/maps/PharmacyMap';
import { MapPin, Navigation, Store, Star, Clock, Phone, CheckCircle2, ChevronRight, X } from 'lucide-react';

interface NearbyPharmaciesPageProps {
  onNavigate: (route: string) => void;
}

export const NearbyPharmaciesPage: React.FC<NearbyPharmaciesPageProps> = ({ onNavigate }) => {
  const { location, setIsLocationModalOpen, detectLocation, isLocating } = useLocation();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [pharmacyInventory, setPharmacyInventory] = useState<any[]>([]);

  useEffect(() => {
    const fetchPharmacies = async () => {
      setIsLoading(true);
      try {
        const data = await api.getPharmacies(location.lat, location.lng);
        setPharmacies(data);
      } catch (err) {
        console.error('Failed to load pharmacies:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPharmacies();
  }, [location.lat, location.lng]);

  const handleViewPharmacy = async (ph: Pharmacy) => {
    setSelectedPharmacy(ph);
    try {
      const details = await api.getPharmacyById(ph.id);
      setPharmacyInventory(details.inventory || []);
    } catch (err) {
      console.error('Failed to load pharmacy details:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Nearby Pharmacies & Stores</h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing pharmacies near <strong className="text-slate-800">{location.area}, {location.city}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={detectLocation}
            disabled={isLocating}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>GPS Locate</span>
          </button>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Change Location</span>
          </button>
        </div>
      </div>

      {/* Interactive Map View */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft">
        <h3 className="font-extrabold text-slate-800 text-sm mb-3">Live Pharmacy Location Map</h3>
        <PharmacyMap
          userLat={location.lat}
          userLng={location.lng}
          pharmacies={pharmacies}
          selectedPharmacyId={selectedPharmacy?.id}
          onSelectPharmacy={handleViewPharmacy}
          height="380px"
        />
      </div>

      {/* Pharmacies List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-800 text-base">Pharmacies Sorted by Distance</h3>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm h-32 skeleton-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pharmacies.map((ph) => (
              <div
                key={ph.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={ph.logo}
                    alt={ph.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-sm truncate">{ph.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ph.is_open ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {ph.is_open ? 'OPEN NOW' : 'CLOSED'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">{ph.address}</p>

                    <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {ph.rating}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-extrabold">{ph.distance_km ?? 1.2} km away</span>
                      <span>•</span>
                      <span className="text-slate-500 font-medium">{ph.estimated_delivery_min} min delivery</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`tel:${ph.phone}`}
                    className="text-xs font-bold text-slate-600 hover:text-emerald-600 flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{ph.phone}</span>
                  </a>

                  <button
                    onClick={() => handleViewPharmacy(ph)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1"
                  >
                    <span>View Store & Stock</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Pharmacy Inventory Modal */}
      {selectedPharmacy && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[85vh] flex flex-col relative">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <img src={selectedPharmacy.logo} className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{selectedPharmacy.name}</h3>
                  <p className="text-xs text-slate-500">{selectedPharmacy.address}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPharmacy(null)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Available Medicines Stock</h4>
              {pharmacyInventory.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Loading pharmacy stock items...</p>
              ) : (
                pharmacyInventory.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">{item.name}</h5>
                      <p className="text-[11px] text-slate-500">{item.brand} • {item.strength}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 text-xs block">₹{item.price}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {item.stock} in stock
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
