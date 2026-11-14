import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  PackageCheck,
  DollarSign,
  Users,
  FileText,
  AlertTriangle,
  Pill,
  Store,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const data = await api.getAdminAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const metrics = analytics?.metrics || {
    totalOrders: 12,
    todayOrders: 3,
    totalRevenue: 2450.00,
    activeUsers: 8,
    pendingPrescriptions: 2,
    totalMedicines: 20,
    lowStockCount: 1
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin & Pharmacist Management Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Pharmacy Dashboard Analytics</h1>
          <p className="text-xs text-slate-300 mt-1">Overview of orders, revenue, inventory stock, and pending prescription reviews</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate('/admin/prescriptions')}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Review Prescriptions ({metrics.pendingPrescriptions})</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/medicines')}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs shadow-md flex items-center gap-1.5 backdrop-blur-sm border border-white/10"
          >
            <Pill className="w-4 h-4" />
            <span>Manage Inventory</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Total Orders</span>
            <PackageCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{metrics.totalOrders}</p>
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
            {metrics.todayOrders} Today
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">₹{metrics.totalRevenue}</p>
          <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full inline-block">
            +18.5% this week
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Pending Prescriptions</span>
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">{metrics.pendingPrescriptions}</p>
          <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full inline-block">
            Needs Review
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">Low Stock Alert</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600">{metrics.lowStockCount}</p>
          <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full inline-block">
            Under 20 items
          </span>
        </div>
      </div>

      {/* Quick Navigation Portal Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('/admin/medicines')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">Manage Medicines</h3>
          <p className="text-xs text-slate-500">Add new medicines, update price, change stock level, toggle prescription requirement.</p>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 pt-1">
            <span>Open Inventory ({metrics.totalMedicines} items)</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('/admin/orders')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <PackageCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-teal-600 transition-colors">Manage Customer Orders</h3>
          <p className="text-xs text-slate-500">View all pending and confirmed orders, update delivery status, print invoices.</p>
          <div className="text-xs font-bold text-teal-600 flex items-center gap-1 pt-1">
            <span>Open Order Queue</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('/admin/prescriptions')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft hover:shadow-xl hover:border-amber-300 transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-amber-600 transition-colors">Pharmacist Verification Portal</h3>
          <p className="text-xs text-slate-500">Review uploaded doctor prescriptions, verify validity, approve or reject fulfillment.</p>
          <div className="text-xs font-bold text-amber-600 flex items-center gap-1 pt-1">
            <span>Open Review Portal ({metrics.pendingPrescriptions} pending)</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
