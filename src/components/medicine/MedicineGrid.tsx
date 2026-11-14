import React from 'react';
import { Medicine } from '../../types';
import { MedicineCard } from './MedicineCard';
import { Pill, SearchX } from 'lucide-react';

interface MedicineGridProps {
  medicines: Medicine[];
  isLoading: boolean;
  onSelectMedicine: (medicine: Medicine) => void;
  onNavigate: (route: string) => void;
}

export const MedicineGrid: React.FC<MedicineGridProps> = ({
  medicines,
  isLoading,
  onSelectMedicine,
  onNavigate
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3 skeleton-pulse">
            <div className="bg-slate-200 aspect-[4/3] rounded-2xl" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-8 bg-slate-200 rounded-xl" />
            <div className="h-10 bg-slate-200 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (medicines.length === 0) {
    return (
      <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-soft">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-slate-800 text-lg">No Medicines Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          We couldn't find any medicines matching your filters. Try clearing your search query or adjusting your price & availability filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {medicines.map((medicine) => (
        <MedicineCard
          key={medicine.id}
          medicine={medicine}
          onSelect={onSelectMedicine}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
};
