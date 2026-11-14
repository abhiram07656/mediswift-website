import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { User, MapPin, FileText, Phone, Mail, ShieldCheck, Edit3, Plus, Trash2, Check } from 'lucide-react';

interface UserProfilePageProps {
  onNavigate: (route: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onNavigate }) => {
  const { user, addresses, refreshUserData } = useAuth();
  const { addToast } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProfile({ name, phone });
      await refreshUserData();
      setIsEditing(false);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Profile update failed:', err);
      addToast('Failed to update profile', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
          alt={user?.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
        />

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-slate-900">{user?.name}</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {user?.role}
            </span>
          </div>

          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5" />
            {user?.email}
          </p>
          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            {user?.phone || '+91 98765 43210'}
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-emerald-600 text-emerald-600 font-extrabold' : 'border-transparent hover:text-slate-800'}`}
        >
          Personal Info
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 border-b-2 transition-colors ${activeTab === 'addresses' ? 'border-emerald-600 text-emerald-600 font-extrabold' : 'border-transparent hover:text-slate-800'}`}
        >
          Saved Delivery Addresses ({addresses.length})
        </button>
      </div>

      {/* Profile Edit Form / Content */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft max-w-xl">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-200 hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Account ID</span>
                <span className="font-mono font-bold text-slate-800">{user?.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Email Address</span>
                <span className="font-bold text-slate-800">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-400 font-medium">Phone Number</span>
                <span className="font-bold text-slate-800">{user?.phone || '+91 98765 43210'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                  {addr.label}
                </span>
                {addr.is_default && (
                  <span className="text-[10px] font-bold text-slate-400">Default Address</span>
                )}
              </div>

              <h4 className="font-bold text-slate-900 text-xs">{addr.full_name}</h4>
              <p className="text-xs text-slate-500">{addr.house_no}, {addr.street}, {addr.area}, {addr.city} - {addr.pincode}</p>
              <p className="text-[11px] text-slate-400">{addr.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
