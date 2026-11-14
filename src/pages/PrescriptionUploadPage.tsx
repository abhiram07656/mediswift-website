import React, { useState, useEffect } from 'react';
import { Prescription } from '../types';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import {
  Upload,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Clock,
  MessageSquare,
  Eye
} from 'lucide-react';

interface PrescriptionUploadPageProps {
  onNavigate: (route: string) => void;
}

export const PrescriptionUploadPage: React.FC<PrescriptionUploadPageProps> = ({ onNavigate }) => {
  const { addToast } = useNotification();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [myPrescriptions, setMyPrescriptions] = useState<Prescription[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const fetchMyPrescriptions = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await api.getMyPrescriptions();
      setMyPrescriptions(data);
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMyPrescriptions();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        addToast('File size must be under 10MB', 'error');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreviewUrl(URL.createObjectURL(file));
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreviewUrl(URL.createObjectURL(file));
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast('Please select or drag a prescription file first', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('prescription', selectedFile);
      formData.append('notes', notes);

      await api.uploadPrescription(formData);
      addToast('Prescription submitted successfully! Sent to pharmacist.', 'success');

      setSelectedFile(null);
      setFilePreviewUrl(null);
      setNotes('');
      await fetchMyPrescriptions();
    } catch (err: any) {
      console.error('Upload error:', err);
      addToast(err.message || 'Prescription upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft">
        <h1 className="text-2xl font-black text-slate-900">Upload Doctor's Prescription</h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload a clear image or PDF of your doctor prescription to purchase prescription-only medicines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm">Upload Prescription Document</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Drag & Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                selectedFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-300 hover:border-emerald-400 bg-slate-50'
              }`}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  {filePreviewUrl ? (
                    <img src={filePreviewUrl} className="w-32 h-32 object-cover rounded-2xl mx-auto shadow-md border" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <FileText className="w-10 h-10" />
                    </div>
                  )}

                  <div>
                    <p className="font-bold text-slate-800 text-xs">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setFilePreviewUrl(null); }}
                    className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold hover:bg-rose-200"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Drag & Drop prescription file here</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Supports JPG, JPEG, PNG, or PDF up to 10MB</p>
                  </div>

                  <label className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800 shadow-md">
                    Browse Files
                    <input type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            {/* Pharmacist Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Add notes for pharmacist (Optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Please provide 1 strip of Amoxyclav 625mg as per prescription..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isUploading ? 'Submitting...' : 'Submit Prescription'}</span>
            </button>
          </form>
        </div>

        {/* Prescription Verification Rules & History */}
        <div className="space-y-6">
          <div className="bg-emerald-50/60 p-5 rounded-3xl border border-emerald-100 space-y-2">
            <h4 className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Pharmacist Verification Process
            </h4>
            <p className="text-xs text-emerald-800/80 leading-relaxed">
              Every uploaded prescription is individually reviewed by our registered pharmacists before order dispatch. Unverified or altered prescriptions will be flagged for doctor verification.
            </p>
          </div>

          {/* Past Prescriptions */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm">My Uploaded Prescriptions</h3>

            {isLoadingHistory ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading prescription history...</p>
            ) : myPrescriptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No prescriptions uploaded yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {myPrescriptions.map((p) => {
                  let statusBadge = <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Pending Review</span>;
                  if (p.status === 'Verified') {
                    statusBadge = <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Verified ✅</span>;
                  } else if (p.status === 'Rejected') {
                    statusBadge = <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Rejected ❌</span>;
                  }

                  return (
                    <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-xs text-slate-800 truncate">{p.file_name}</span>
                        </div>
                        {statusBadge}
                      </div>

                      {p.notes && (
                        <p className="text-[11px] text-slate-500 italic">"{p.notes}"</p>
                      )}

                      {p.pharmacist_notes && (
                        <div className="p-2 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 border border-emerald-100 flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold">Pharmacist Note:</span> {p.pharmacist_notes}
                          </div>
                        </div>
                      )}

                      <span className="text-[10px] text-slate-400 block">
                        Uploaded on {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
