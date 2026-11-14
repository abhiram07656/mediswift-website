import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { Medicine, Pharmacy, Category } from '../types';
import { api } from '../services/api';
import { MedicineGrid } from '../components/medicine/MedicineGrid';
import { MedicineDetailModal } from '../components/medicine/MedicineDetailModal';
import { PharmacyMap } from '../components/maps/PharmacyMap';
import {
  Search,
  Mic,
  MapPin,
  Upload,
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Store,
  Star,
  ArrowRight,
  Pill,
  Thermometer,
  Activity,
  Heart,
  Zap
} from 'lucide-react';

interface HomeDashboardProps {
  onNavigate: (route: string, params?: any) => void;
  onOpenVoiceSearch: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigate,
  onOpenVoiceSearch
}) => {
  const { user } = useAuth();
  const { location } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [catData, medData, phData] = await Promise.all([
          api.getCategories(),
          api.getMedicines(),
          api.getPharmacies(location.lat, location.lng)
        ]);
        setCategories(catData);
        setMedicines(medData);
        setPharmacies(phData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [location.lat, location.lng]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 1) {
      const matches = medicines
        .filter(m => m.name.toLowerCase().includes(val.toLowerCase()) || m.brand.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 5)
        .map(m => m.name);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('/medicines', { search: searchQuery });
    }
  };

  // Greeting time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 shadow-xl overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Fast Healthcare Delivery Platform</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {greeting}, {user?.name.split(' ')[0] || 'Abhiram'} 👋
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 font-medium">
            Find your medicines and get them delivered to your nearest location in <span className="font-extrabold text-white underline decoration-emerald-400">20–30 minutes</span>.
          </p>

          {/* 2. Large Search Bar Section */}
          <div className="pt-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search medicines, tablets, syrups, health products..."
                  className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-400/50 shadow-2xl"
                />

                <div className="absolute right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onOpenVoiceSearch}
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Voice Search"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Search Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in">
                  <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Suggestions</p>
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSearchQuery(s);
                        onNavigate('/medicines', { search: s });
                      }}
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-800 flex items-center justify-between"
                    >
                      <span>{s}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* 3. Quick Upload Prescription Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border border-emerald-200/80 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Have a Doctor's Prescription?</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Upload prescription image/PDF and our licensed pharmacist will verify & fulfill your order.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/upload-prescription')}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-200 flex items-center gap-2 whitespace-nowrap transition-all hover:scale-105 shrink-0"
        >
          <Upload className="w-4 h-4" />
          Upload Prescription
        </button>
      </div>

      {/* 4. Medicine Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Explore Categories</h2>
            <p className="text-xs text-slate-500">Browse medicines by health concern</p>
          </div>
          <button
            onClick={() => onNavigate('/categories')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.slice(0, 6).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('/medicines', { category: cat.slug })}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group text-center space-y-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center mx-auto shadow-inner">
                <Pill className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-xs truncate group-hover:text-emerald-700">{cat.name}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Nearest Pharmacies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Pharmacies Near You</h2>
            <p className="text-xs text-slate-500">Sorted by real-time distance from {location.area}</p>
          </div>
          <button
            onClick={() => onNavigate('/pharmacies')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Map View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pharmacies.slice(0, 3).map((ph) => (
            <div
              key={ph.id}
              onClick={() => onNavigate('/pharmacies')}
              className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <img
                  src={ph.logo}
                  alt={ph.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-slate-800 text-xs truncate">{ph.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{ph.address}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] font-bold">
                    <span className="text-amber-500 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {ph.rating}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{ph.distance_km ?? 1.2} km away</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {ph.estimated_delivery_min} min delivery
                </span>
                <span className="text-emerald-600 font-bold hover:underline flex items-center gap-0.5">
                  View Pharmacy <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Popular Medicines Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Popular & Essential Medicines</h2>
            <p className="text-xs text-slate-500">Fast delivery medicines in high demand</p>
          </div>
          <button
            onClick={() => onNavigate('/medicines')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>See All ({medicines.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <MedicineGrid
          medicines={medicines.slice(0, 8)}
          isLoading={isLoading}
          onSelectMedicine={(med) => setSelectedMedicine(med)}
          onNavigate={onNavigate}
        />
      </div>

      {/* Medicine Details Modal */}
      <MedicineDetailModal
        medicine={selectedMedicine}
        isOpen={Boolean(selectedMedicine)}
        onClose={() => setSelectedMedicine(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
