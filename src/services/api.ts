import { Medicine, Pharmacy, Category, Order, Prescription, CartItem, CartSummary, User, Address, NotificationItem } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('mediswift_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An unexpected error occurred' }));
    throw new Error(errorData.error || `HTTP Error ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async register(name: string, email: string, password: string, phone?: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    return handleResponse<{ user: User; addresses: Address[] }>(res);
  },

  async updateProfile(data: { name?: string; phone?: string; avatar?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ message: string; user: User }>(res);
  },

  // Medicines
  async getCategories() {
    const res = await fetch(`${API_BASE}/medicines/categories`);
    return handleResponse<Category[]>(res);
  },

  async getMedicines(params?: {
    search?: string;
    category?: string;
    prescription?: boolean;
    available?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.prescription !== undefined) query.append('prescription', params.prescription ? 'true' : 'false');
    if (params?.available) query.append('available', 'true');
    if (params?.minPrice) query.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice) query.append('maxPrice', params.maxPrice.toString());
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/medicines?${query.toString()}`);
    return handleResponse<Medicine[]>(res);
  },

  async getMedicineById(id: string) {
    const res = await fetch(`${API_BASE}/medicines/${id}`);
    return handleResponse<Medicine & { pharmacies: any[] }>(res);
  },

  // Pharmacies
  async getPharmacies(lat?: number, lng?: number, search?: string) {
    const query = new URLSearchParams();
    if (lat) query.append('lat', lat.toString());
    if (lng) query.append('lng', lng.toString());
    if (search) query.append('search', search);

    const res = await fetch(`${API_BASE}/pharmacies?${query.toString()}`);
    return handleResponse<Pharmacy[]>(res);
  },

  async getPharmacyById(id: string) {
    const res = await fetch(`${API_BASE}/pharmacies/${id}`);
    return handleResponse<Pharmacy & { inventory: any[] }>(res);
  },

  // Prescriptions
  async uploadPrescription(formData: FormData) {
    const res = await fetch(`${API_BASE}/prescriptions/upload`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData
    });
    return handleResponse<{ message: string; prescription: Prescription }>(res);
  },

  async getMyPrescriptions() {
    const res = await fetch(`${API_BASE}/prescriptions/my-prescriptions`, {
      headers: getAuthHeader()
    });
    return handleResponse<Prescription[]>(res);
  },

  // Cart
  async getCart() {
    const res = await fetch(`${API_BASE}/cart`, {
      headers: getAuthHeader()
    });
    return handleResponse<{ items: CartItem[]; summary: CartSummary }>(res);
  },

  async addToCart(medicine_id: string, pharmacy_id: string, quantity = 1) {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicine_id, pharmacy_id, quantity })
    });
    return handleResponse<{ message: string }>(res);
  },

  async updateCartItem(cart_item_id: string, quantity: number) {
    const res = await fetch(`${API_BASE}/cart/update`, {
      method: 'PUT',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart_item_id, quantity })
    });
    return handleResponse<{ message: string }>(res);
  },

  async removeFromCart(cart_item_id: string) {
    const res = await fetch(`${API_BASE}/cart/remove/${cart_item_id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ message: string }>(res);
  },

  async clearCart() {
    const res = await fetch(`${API_BASE}/cart/clear`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ message: string }>(res);
  },

  // Orders
  async placeOrder(orderData: {
    pharmacy_id: string;
    address_id: string;
    payment_method: string;
    items: { medicine_id: string; quantity: number }[];
    prescription_id?: string;
  }) {
    const res = await fetch(`${API_BASE}/orders/place`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return handleResponse<{ message: string; order: Order }>(res);
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getAuthHeader()
    });
    return handleResponse<Order[]>(res);
  },

  async getOrderById(id: string) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getAuthHeader()
    });
    return handleResponse<Order>(res);
  },

  async getOrderTracking(id: string) {
    const res = await fetch(`${API_BASE}/orders/${id}/tracking`, {
      headers: getAuthHeader()
    });
    return handleResponse<{ order: any; steps: any[]; current_driver: any }>(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeader()
    });
    return handleResponse<{ notifications: NotificationItem[]; unreadCount: number }>(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    return handleResponse<{ message: string }>(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    return handleResponse<{ message: string }>(res);
  },

  // Admin API
  async getAdminAnalytics() {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  async getAdminMedicines() {
    const res = await fetch(`${API_BASE}/admin/medicines`, {
      headers: getAuthHeader()
    });
    return handleResponse<Medicine[]>(res);
  },

  async createAdminMedicine(medicineData: Partial<Medicine>) {
    const res = await fetch(`${API_BASE}/admin/medicines`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(medicineData)
    });
    return handleResponse<{ message: string; medicine: Medicine }>(res);
  },

  async updateAdminMedicine(id: string, medicineData: Partial<Medicine>) {
    const res = await fetch(`${API_BASE}/admin/medicines/${id}`, {
      method: 'PUT',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(medicineData)
    });
    return handleResponse<{ message: string; medicine: Medicine }>(res);
  },

  async deleteAdminMedicine(id: string) {
    const res = await fetch(`${API_BASE}/admin/medicines/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    return handleResponse<{ message: string }>(res);
  },

  async getAdminPharmacies() {
    const res = await fetch(`${API_BASE}/admin/pharmacies`, {
      headers: getAuthHeader()
    });
    return handleResponse<Pharmacy[]>(res);
  },

  async createAdminPharmacy(pharmacyData: Partial<Pharmacy>) {
    const res = await fetch(`${API_BASE}/admin/pharmacies`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(pharmacyData)
    });
    return handleResponse<{ message: string; pharmacy: Pharmacy }>(res);
  },

  async updateAdminPharmacy(id: string, pharmacyData: Partial<Pharmacy>) {
    const res = await fetch(`${API_BASE}/admin/pharmacies/${id}`, {
      method: 'PUT',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(pharmacyData)
    });
    return handleResponse<{ message: string; pharmacy: Pharmacy }>(res);
  },

  async getAdminOrders(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`${API_BASE}/admin/orders${query}`, {
      headers: getAuthHeader()
    });
    return handleResponse<Order[]>(res);
  },

  async updateOrderStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_status: status })
    });
    return handleResponse<{ message: string; order: Order }>(res);
  },

  async getAdminPrescriptions() {
    const res = await fetch(`${API_BASE}/admin/prescriptions`, {
      headers: getAuthHeader()
    });
    return handleResponse<Prescription[]>(res);
  },

  async updatePrescriptionStatus(id: string, status: string, pharmacist_notes?: string) {
    const res = await fetch(`${API_BASE}/admin/prescriptions/${id}/status`, {
      method: 'PUT',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, pharmacist_notes })
    });
    return handleResponse<{ message: string; prescription: Prescription }>(res);
  }
};
