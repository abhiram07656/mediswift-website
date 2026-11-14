export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'pharmacist';
  phone?: string;
  avatar?: string;
  created_at?: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  house_no: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  is_default: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  brand: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  strength: string;
  manufacturer: string;
  price: number;
  discount: number;
  availability: boolean;
  prescription_required: boolean;
  description: string;
  uses: string;
  warnings: string;
  storage_info: string;
  image: string;
  available_pharmacies?: PharmacyStock[];
}

export interface PharmacyStock {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  stock: number;
  price_override?: number;
  pharmacy_name: string;
  estimated_delivery_min: number;
  lat: number;
  lng: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  logo: string;
  rating: number;
  address: string;
  city: string;
  area: string;
  pincode: string;
  lat: number;
  lng: number;
  phone: string;
  is_open: boolean;
  estimated_delivery_min: number;
  distance_km?: number;
}

export interface Prescription {
  id: string;
  user_id: string;
  order_id?: string;
  file_path: string;
  file_name: string;
  file_type: string;
  notes?: string;
  status: 'Pending Review' | 'Verified' | 'Needs Clarification' | 'Rejected';
  pharmacist_notes?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  order_number?: string;
}

export interface CartItem {
  id: string;
  quantity: number;
  medicine_id: string;
  pharmacy_id: string;
  medicine_name: string;
  generic_name: string;
  brand: string;
  strength: string;
  price: number;
  discount: number;
  discounted_price: number;
  item_total: number;
  image: string;
  prescription_required: boolean;
  pharmacy_name: string;
  estimated_delivery_min: number;
}

export interface CartSummary {
  subtotal: number;
  delivery_fee: number;
  total: number;
  item_count: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  medicine_id: string;
  medicine_name: string;
  generic_name: string;
  brand: string;
  image: string;
  strength: string;
  quantity: number;
  unit_price: number;
  prescription_required: boolean;
}

export interface DeliveryStep {
  id: string;
  order_id: string;
  step: 'Order Placed' | 'Pharmacy Confirmed' | 'Medicine Packed' | 'Out for Delivery' | 'Delivered';
  status: 'completed' | 'active' | 'pending';
  timestamp: string;
  driver_name?: string;
  driver_phone?: string;
  driver_lat?: number;
  driver_lng?: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  pharmacy_id: string;
  address_id: string;
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: 'Placed' | 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  created_at: string;
  pharmacy_name: string;
  pharmacy_logo?: string;
  pharmacy_address?: string;
  pharmacy_phone?: string;
  delivery_name?: string;
  delivery_phone?: string;
  house_no?: string;
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  items?: OrderItem[];
  tracking?: DeliveryStep[];
  prescription?: Prescription;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
}

export interface UserLocation {
  city: string;
  area: string;
  pincode: string;
  address: string;
  lat: number;
  lng: number;
  isCustom: boolean;
}
