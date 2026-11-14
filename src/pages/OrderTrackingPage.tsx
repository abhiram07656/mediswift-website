import React, { useState, useEffect } from 'react';
import { Order, DeliveryStep } from '../types';
import { api } from '../services/api';
import { PharmacyMap } from '../components/maps/PharmacyMap';
import { useNotification } from '../context/NotificationContext';
import {
  PackageCheck,
  Clock,
  MapPin,
  Store,
  Phone,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Play,
  ArrowLeft
} from 'lucide-react';

interface OrderTrackingPageProps {
  orderId?: string;
  onNavigate: (route: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, onNavigate }) => {
  const { addToast } = useNotification();
  const [orderData, setOrderData] = useState<any>(null);
  const [steps, setSteps] = useState<DeliveryStep[]>([]);
  const [currentDriver, setCurrentDriver] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const targetId = orderId || 'ord-1001';

  const fetchTracking = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrderTracking(targetId);
      setOrderData(data.order);
      setSteps(data.steps);
      setCurrentDriver(data.current_driver);
    } catch (err) {
      console.error('Failed to load order tracking:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [targetId]);

  // Simulate next delivery step progression for demo testing
  const handleSimulateNextStep = async () => {
    if (!orderData) return;
    const currentStatus = orderData.order_status;
    let nextStatus = 'Confirmed';
    if (currentStatus === 'Placed') nextStatus = 'Confirmed';
    else if (currentStatus === 'Confirmed') nextStatus = 'Preparing';
    else if (currentStatus === 'Preparing') nextStatus = 'Out for Delivery';
    else if (currentStatus === 'Out for Delivery') nextStatus = 'Delivered';

    try {
      await api.updateOrderStatus(orderData.id, nextStatus);
      addToast(`Simulated status update: ${nextStatus}!`, 'info');
      await fetchTracking();
    } catch (err) {
      console.error('Failed to simulate status update:', err);
    }
  };

  const stepsList = [
    { name: 'Order Placed', desc: 'Order received by system' },
    { name: 'Pharmacy Confirmed', desc: 'Apollo Pharmacy verified medicines' },
    { name: 'Medicine Packed', desc: 'Prescription packed in tamper-proof bag' },
    { name: 'Out for Delivery', desc: 'Ramesh Kumar is on the way' },
    { name: 'Delivered', desc: 'Delivered to your doorstep' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/orders')}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Live Order Tracking</h1>
            <p className="text-xs text-slate-500">
              Order ID: <span className="font-mono font-bold text-emerald-600">#{orderData?.order_number || 'ORD-20260821-00125'}</span>
            </p>
          </div>
        </div>

        {/* Demo Simulation Action Button */}
        <button
          onClick={handleSimulateNextStep}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5"
          title="Simulate status progression for live demo"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Simulate Next Step</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Map & Step Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Delivery Map */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                Live Delivery Map
              </h3>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                ⚡ ETA: ~15 mins
              </span>
            </div>

            <PharmacyMap
              userLat={orderData?.user_lat || 12.9352}
              userLng={orderData?.user_lng || 77.6245}
              pharmacies={[{
                id: 'ph-01',
                name: orderData?.pharmacy_name || 'Apollo Pharmacy',
                logo: '',
                rating: 4.8,
                address: '',
                city: '',
                area: '',
                pincode: '',
                lat: orderData?.pharmacy_lat || 12.9340,
                lng: orderData?.pharmacy_lng || 77.6220,
                phone: '',
                is_open: true,
                estimated_delivery_min: 20
              }]}
              height="340px"
              showDeliveryRoute={true}
              driverLat={currentDriver?.lat || 12.9348}
              driverLng={currentDriver?.lng || 77.6235}
            />
          </div>

          {/* Visual Order Status Timeline */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-6">
            <h3 className="font-extrabold text-slate-800 text-sm">Order Status Timeline</h3>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {stepsList.map((step, idx) => {
                const isCompleted = orderData?.order_status === 'Delivered' || idx <= (
                  orderData?.order_status === 'Placed' ? 0 :
                  orderData?.order_status === 'Confirmed' ? 1 :
                  orderData?.order_status === 'Preparing' ? 2 :
                  orderData?.order_status === 'Out for Delivery' ? 3 : 4
                );
                const isActive = idx === (
                  orderData?.order_status === 'Placed' ? 0 :
                  orderData?.order_status === 'Confirmed' ? 1 :
                  orderData?.order_status === 'Preparing' ? 2 :
                  orderData?.order_status === 'Out for Delivery' ? 3 : 4
                );

                return (
                  <div key={idx} className="relative flex items-start gap-4 group">
                    {/* Circle Pin */}
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                      isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300'
                    }`}>
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-extrabold ${isActive ? 'text-emerald-700 font-black' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                          {step.name}
                        </h4>
                        {isActive && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Driver & Pharmacy Cards */}
        <div className="space-y-6">
          {/* Driver Info Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm">Delivery Agent</h3>

            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
              />
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs">{currentDriver?.name || 'Ramesh Kumar'}</h4>
                <p className="text-[11px] text-emerald-600 font-bold">MediSwift Verified Rider</p>
                <p className="text-[10px] text-slate-400">Vaccinated • Temperature Checked 36.5°C</p>
              </div>
            </div>

            <a
              href={`tel:${currentDriver?.phone || '+91 99887 76655'}`}
              className="w-full py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Delivery Agent ({currentDriver?.phone || '+91 99887 76655'})</span>
            </a>
          </div>

          {/* Pharmacy Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-soft space-y-3 text-xs">
            <h3 className="font-extrabold text-slate-800 text-sm">Fulfilling Store</h3>
            <p className="font-bold text-slate-900">{orderData?.pharmacy_name || 'Apollo Pharmacy Koramangala'}</p>
            <p className="text-slate-500">77, 80 Feet Road, Koramangala 4th Block, Bengaluru</p>
          </div>
        </div>
      </div>
    </div>
  );
};
