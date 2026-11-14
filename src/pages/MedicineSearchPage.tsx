import React, { useState, useEffect } from 'react';
import { Medicine, Category } from '../types';
import { api } from '../services/api';
import { MedicineGrid } from '../components/medicine/MedicineGrid';
import { MedicineDetailModal } from '../components/medicine/MedicineDetailModal';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X, Check, ShieldAlert } from 'lucide-react';

interface MedicineSearchPageProps {
  initialSearch?: string;
  initialCategory?: string;
  onNavigate: (route: string) => void;
}

export const MedicineSearchPage: React.FC<MedicineSearchPageProps> = ({
  initialSearch = '',
  initialCategory = '',
  onNavigate
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [prescriptionOnly, setPrescriptionOnly] = useState<boolean | undefined>(undefined);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sort, setSort] = useState<string>('name');

  const [categories, setCategories] = useState<Category[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchFiltered = async () => {
      setIsLoading(true);
      try {
        const data = await api.getMedicines({
          search,
          category: selectedCategory,
          prescription: prescriptionOnly,
          available: availableOnly,
          maxPrice: maxPrice < 3000 ? maxPrice : undefined,
          sort
        });
        setMedicines(data);
      } catch (err) {
        console.error('Failed to fetch filtered medicines:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiltered();
  }, [search, selectedCategory, prescriptionOnly, availableOnly, maxPrice, sort]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setPrescriptionOnly(undefined);
    setAvailableOnly(false);
    setMaxPrice(3000);
    setSort('name');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <h1 className="text-2xl font-black text-slate-900">Medicine Search Store</h1>
        <p className="text-xs text-slate-500 mt-1">Search medicines by name, generic composition, brand or category</p>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type medicine name (e.g. Paracetamol, Dolo, Crocin)..."
            className="w-full pl-12 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="space-y-6 lg:block hidden">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                Filters
              </h3>
              <button
                onClick={clearFilters}
                className="text-xs text-emerald-600 hover:underline font-bold"
              >
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Prescription Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Prescription Requirement</label>
              <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="prescription"
                    checked={prescriptionOnly === undefined}
                    onChange={() => setPrescriptionOnly(undefined)}
                    className="accent-emerald-600"
                  />
                  <span>All Medicines</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="prescription"
                    checked={prescriptionOnly === false}
                    onChange={() => setPrescriptionOnly(false)}
                    className="accent-emerald-600"
                  />
                  <span>OTC (No Prescription)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="prescription"
                    checked={prescriptionOnly === true}
                    onChange={() => setPrescriptionOnly(true)}
                    className="accent-emerald-600"
                  />
                  <span className="flex items-center gap-1 text-amber-700 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Prescription Required
                  </span>
                </label>
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Max Price</span>
                <span className="text-emerald-600">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="3000"
                step="50"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Bar: Count & Sorting */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs font-medium text-slate-600">
            <span>Showing <strong className="text-slate-900 font-extrabold">{medicines.length}</strong> medicines</span>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort By:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>

          <MedicineGrid
            medicines={medicines}
            isLoading={isLoading}
            onSelectMedicine={setSelectedMedicine}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <MedicineDetailModal
        medicine={selectedMedicine}
        isOpen={Boolean(selectedMedicine)}
        onClose={() => setSelectedMedicine(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
