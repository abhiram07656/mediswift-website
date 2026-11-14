import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LocationModal } from './components/common/LocationModal';
import { VoiceSearchModal } from './components/common/VoiceSearchModal';
import { CartDrawer } from './components/cart/CartDrawer';

import { HomeDashboard } from './pages/HomeDashboard';
import { MedicineSearchPage } from './pages/MedicineSearchPage';
import { NearbyPharmaciesPage } from './pages/NearbyPharmaciesPage';
import { PrescriptionUploadPage } from './pages/PrescriptionUploadPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { UserProfilePage } from './pages/UserProfilePage';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMedicines } from './pages/admin/AdminMedicines';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminPrescriptions } from './pages/admin/AdminPrescriptions';

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-emerald-500'
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-500'
              : 'bg-slate-800 text-white border-slate-600'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}
          <div className="flex-1 text-xs font-semibold leading-snug">{toast.message}</div>
          <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('/');
  const [routeParams, setRouteParams] = useState<any>({});
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);

  const handleNavigate = (route: string, params?: any) => {
    setCurrentRoute(route);
    if (params) setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case '/':
        return (
          <HomeDashboard
            onNavigate={handleNavigate}
            onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
          />
        );
      case '/medicines':
      case '/categories':
        return (
          <MedicineSearchPage
            initialSearch={routeParams.search || ''}
            initialCategory={routeParams.category || ''}
            onNavigate={handleNavigate}
          />
        );
      case '/pharmacies':
        return <NearbyPharmaciesPage onNavigate={handleNavigate} />;
      case '/upload-prescription':
        return <PrescriptionUploadPage onNavigate={handleNavigate} />;
      case '/checkout':
      case '/cart':
        return <CheckoutPage onNavigate={handleNavigate} />;
      case '/order-confirmation':
        return <OrderConfirmationPage order={routeParams.order || null} onNavigate={handleNavigate} />;
      case '/orders':
        return <MyOrdersPage onNavigate={handleNavigate} />;
      case '/order-tracking':
        return <OrderTrackingPage orderId={routeParams.id} onNavigate={handleNavigate} />;
      case '/profile':
        return <UserProfilePage onNavigate={handleNavigate} />;
      case '/admin':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case '/admin/medicines':
        return <AdminMedicines onNavigate={handleNavigate} />;
      case '/admin/orders':
        return <AdminOrders onNavigate={handleNavigate} />;
      case '/admin/prescriptions':
        return <AdminPrescriptions onNavigate={handleNavigate} />;
      default:
        return <HomeDashboard onNavigate={handleNavigate} onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNavigate={handleNavigate}
        currentRoute={currentRoute}
        onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
      />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 lg:pl-64 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <LocationModal />
      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onSelectQuery={(query) => handleNavigate('/medicines', { search: query })}
      />
      <CartDrawer onNavigate={handleNavigate} />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <NotificationProvider>
            <MainLayout />
          </NotificationProvider>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
