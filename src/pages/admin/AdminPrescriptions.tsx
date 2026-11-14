import React, { useState, useEffect } from 'react';
import { Prescription } from '../../types';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { FileText, ShieldCheck, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Eye, MessageSquare } from 'lucide-react';

interface AdminPrescriptionsProps {
  onNavigate: (route: string) => void;
}

export const AdminPrescriptions: React.FC<AdminPrescriptionsProps> = ({ onNavigate }) => {
  const { addToast } = useNotification();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [pharmacistNotes, setPharmacistNotes] = useState('');

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminPrescriptions();
      setPrescriptions(data);
      if (data.length > 0) {
        setSelectedPrescription(data[0]);
        setPharmacistNotes(data[0].pharmacist_notes || '');
      }
    } catch (err) {
      console.error('Failed to fetch admin prescriptions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedPrescription) return;

    try {
      await api.updatePrescriptionStatus(selectedPrescription.id, status, pharmacistNotes);
      addToast(`Prescription status updated to "${status}"`, 'success');
      await fetchPrescriptions();
    } catch (err) {
      console.error('Failed to update prescription status:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('/admin')} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Pharmacist Prescription Review Portal</h1>
            <p className="text-xs text-slate-500">Verify uploaded doctor prescriptions before medicine order fulfillment</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold text-amber-800">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Licensed Pharmacist Session Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Queue List */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-3">
          <h3 className="font-extrabold text-slate-800 text-sm">Upload Queue ({prescriptions.length})</h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {prescriptions.map((p) => {
              const isSelected = selectedPrescription?.id === p.id;
              let badge = <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">Pending</span>;
              if (p.status === 'Verified') badge = <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">Approved</span>;
              else if (p.status === 'Rejected') badge = <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px] font-bold">Rejected</span>;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPrescription(p);
                    setPharmacistNotes(p.pharmacist_notes || '');
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected ? 'border-emerald-600 bg-emerald-50/40 shadow-sm' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 truncate">{p.user_name || 'Customer'}</span>
                    {badge}
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.file_name}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Uploaded: {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Side-by-Side Review Pane */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPrescription ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Document Review: {selectedPrescription.file_name}</h3>
                  <p className="text-xs text-slate-500">Customer: {selectedPrescription.user_name} ({selectedPrescription.user_phone})</p>
                </div>

                <span className="font-mono text-xs text-slate-400">ID: {selectedPrescription.id}</span>
              </div>

              {/* Document Image View */}
              <div className="bg-slate-900 p-4 rounded-2xl min-h-[300px] flex items-center justify-center border border-slate-800">
                {selectedPrescription.file_path.endsWith('.pdf') ? (
                  <div className="text-center text-slate-400 space-y-2">
                    <FileText className="w-12 h-12 text-emerald-400 mx-auto" />
                    <p className="text-xs font-bold">PDF Prescription File</p>
                    <a href={selectedPrescription.file_path} target="_blank" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold inline-block">
                      Open PDF in New Window
                    </a>
                  </div>
                ) : (
                  <img
                    src={selectedPrescription.file_path}
                    alt="Prescription Document"
                    className="max-h-[360px] object-contain rounded-xl shadow-2xl"
                  />
                )}
              </div>

              {/* Patient Notes */}
              {selectedPrescription.notes && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">Patient Instruction Notes:</span>
                  <p className="italic">"{selectedPrescription.notes}"</p>
                </div>
              )}

              {/* Pharmacist Review Input & Decision Buttons */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-700">Pharmacist Verification Notes</label>
                <textarea
                  value={pharmacistNotes}
                  onChange={e => setPharmacistNotes(e.target.value)}
                  rows={2}
                  placeholder="Enter pharmacist verification remarks (e.g. Verified by Dr. Rajesh Sharma, Reg #33921)..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => handleUpdateStatus('Verified')}
                    className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve (Verified)
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('Needs Clarification')}
                    className="py-3 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Need Clarification
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('Rejected')}
                    className="py-3 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Prescription
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
              Select a prescription from the left queue to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
