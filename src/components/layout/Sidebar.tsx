import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  LayoutDashboard,
  Pill,
  Grid,
  FileText,
  MapPin,
  ShoppingCart,
  PackageCheck,
  History,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  X,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  currentRoute,
  onNavigate
}) => {
  const { user, logout } = useAuth();
  const { summary } = useCart();

  const navItems = [
    { label: 'Dashboard', route: '/', icon: LayoutDashboard },
    { label: 'Medicines', route: '/medicines', icon: Pill },
    { label: 'Categories', route: '/categories', icon: Grid },
    { label: 'Upload Prescription', route: '/upload-prescription', icon: FileText, badge: 'Rx' },
    { label: 'Nearby Pharmacies', route: '/pharmacies', icon: MapPin },
    { label: 'Cart', route: '/cart', icon: ShoppingCart, count: summary.item_count },
    { label: 'My Orders', route: '/orders', icon: PackageCheck },
    { label: 'Order History', route: '/orders?filter=history', icon: History },
    { label: 'Profile', route: '/profile', icon: User },
    { label: 'Settings', route: '/profile?tab=settings', icon: Settings },
  ];

  if (user?.role === 'admin' || user?.role === 'pharmacist') {
    navItems.push({ label: 'Admin Portal', route: '/admin', icon: ShieldCheck, badge: 'PRO' });
  }

  const handleLinkClick = (route: string) => {
    onNavigate(route);
    onClose();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Top Header Logo */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleLinkClick('/')}>
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <Pill className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-slate-900">Medi<span className="text-emerald-600">Swift</span></span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;

            return (
              <button
                key={item.route}
                onClick={() => handleLinkClick(item.route)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {item.count}
                  </span>
                )}

                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom User Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover border border-emerald-500"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
