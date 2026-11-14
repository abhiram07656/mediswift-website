import React, { useState, useEffect } from 'react';
import { Medicine, Category } from '../../types';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Pill, Plus, Edit2, Trash2, ShieldAlert, X, Check, ArrowLeft } from 'lucide-react';

interface AdminMedicinesProps {
  onNavigate: (route: string) => void;
}

export const AdminMedicines: React.FC<AdminMedicinesProps> = ({ onNavigate }) => {
  const { addToast } = useNotification();

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('cat-01');
  const [strength, setStrength] = useState('500mg');
  const [manufacturer, setManufacturer] = useState('Generic Pharma');
  const [price, setPrice] = useState<number>(50);
  const [discount, setDiscount] = useState<number>(0);
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [description, setDescription] = useState('');
  const [uses, setUses] = useState('');
  const [warnings, setWarnings] = useState('');
  const [storageInfo, setStorageInfo] = useState('');
  const [image, setImage] = useState('');

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const [meds, cats] = await Promise.all([api.getAdminMedicines(), api.getCategories()]);
      setMedicines(meds);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load admin medicines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const openAddModal = () => {
    setEditingMedicine(null);
    setName('');
    setGenericName('');
    setBrand('');
    setCategoryId(categories[0]?.id || 'cat-01');
    setStrength('500mg');
    setManufacturer('Generic Pharma');
    setPrice(50);
    setDiscount(0);
    setPrescriptionRequired(false);
    setDescription('');
    setUses('');
    setWarnings('');
    setStorageInfo('');
    setImage('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (med: Medicine) => {
    setEditingMedicine(med);
    setName(med.name);
    setGenericName(med.generic_name);
    setBrand(med.brand);
    setCategoryId(med.category_id);
    setStrength(med.strength);
    setManufacturer(med.manufacturer);
    setPrice(med.price);
    setDiscount(med.discount);
    setPrescriptionRequired(med.prescription_required);
    setDescription(med.description);
    setUses(med.uses);
    setWarnings(med.warnings);
    setStorageInfo(med.storage_info);
    setImage(med.image);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        generic_name: genericName,
        brand,
        category_id: categoryId,
        strength,
        manufacturer,
        price,
        discount,
        prescription_required: prescriptionRequired,
        description,
        uses,
        warnings,
        storage_info: storageInfo,
        image
      };

      if (editingMedicine) {
        await api.updateAdminMedicine(editingMedicine.id, payload);
        addToast(`Updated ${name} successfully!`, 'success');
      } else {
        await api.createAdminMedicine(payload);
        addToast(`Added ${name} to inventory!`, 'success');
      }

      setIsModalOpen(false);
      await fetchMedicines();
    } catch (err: any) {
      console.error('Save error:', err);
      addToast(err.message || 'Failed to save medicine', 'error');
    }
  };

  const handleDelete = async (id: string, medName: string) => {
    if (confirm(`Are you sure you want to delete ${medName}?`)) {
      try {
        await api.deleteAdminMedicine(id);
        addToast(`Deleted ${medName}`, 'info');
        await fetchMedicines();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('/admin')} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Medicine Inventory Management</h1>
            <p className="text-xs text-slate-500">Add, edit, update prices or set prescription requirements</p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-center text-xs text-slate-400">Loading medicine inventory...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Medicine Info</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / Disc</th>
                  <th className="p-4">Prescription</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {medicines.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={med.image} className="w-10 h-10 rounded-xl object-cover border" />
                        <div>
                          <p className="font-extrabold text-slate-900">{med.name}</p>
                          <p className="text-[11px] text-slate-400">{med.brand} • {med.strength}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-800">
                      {med.category_name || 'General'}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-900">₹{med.price}</span>
                      {med.discount > 0 && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-extrabold ml-1.5">
                          {med.discount}% OFF
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {med.prescription_required ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit">
                          <ShieldAlert className="w-3 h-3" />
                          Required
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px] w-fit block">
                          OTC
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(med)}
                          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(med.id, med.name)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-base mb-4">
              {editingMedicine ? `Edit Medicine: ${editingMedicine.name}` : 'Add New Medicine'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Medicine Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2.5 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name</label>
                  <input type="text" value={brand} onChange={e => setBrand(e.target.value)} required className="w-full p-2.5 rounded-xl border" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Generic Name</label>
                  <input type="text" value={genericName} onChange={e => setGenericName(e.target.value)} required className="w-full p-2.5 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-2.5 rounded-xl border">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required className="w-full p-2.5 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount (%)</label>
                  <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-full p-2.5 rounded-xl border" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Strength</label>
                  <input type="text" value={strength} onChange={e => setStrength(e.target.value)} className="w-full p-2.5 rounded-xl border" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="rx" checked={prescriptionRequired} onChange={e => setPrescriptionRequired(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
                <label htmlFor="rx" className="font-bold text-amber-800 cursor-pointer">Prescription Required for purchase</label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full p-2.5 rounded-xl border" />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl border font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-md">Save Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
