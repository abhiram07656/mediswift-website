import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, 'mediswift_db.json');

export interface DbSchema {
  users: any[];
  addresses: any[];
  categories: any[];
  medicines: any[];
  pharmacies: any[];
  pharmacy_medicines: any[];
  prescriptions: any[];
  cart_items: any[];
  orders: any[];
  order_items: any[];
  delivery_tracking: any[];
  notifications: any[];
}

const defaultDb: DbSchema = {
  users: [],
  addresses: [],
  categories: [],
  medicines: [],
  pharmacies: [],
  pharmacy_medicines: [],
  prescriptions: [],
  cart_items: [],
  orders: [],
  order_items: [],
  delivery_tracking: [],
  notifications: []
};

class MemoryDb {
  data: DbSchema;

  constructor() {
    this.data = this.load();
  }

  load(): DbSchema {
    if (fs.existsSync(dbFilePath)) {
      try {
        const content = fs.readFileSync(dbFilePath, 'utf-8');
        return JSON.parse(content);
      } catch (err) {
        console.error('Error loading DB file, resetting:', err);
      }
    }
    return { ...defaultDb };
  }

  save() {
    fs.writeFileSync(dbFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  pragma(_cmd: string) {
    // No-op for compatibility
  }

  exec(_sql: string) {
    // Schema initialized in JSON constructor
  }

  prepare(sql: string) {
    const self = this;
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    return {
      all(...params: any[]): any[] {
        return self.executeQueryAll(cleanSql, params);
      },
      get(...params: any[]): any {
        const results = self.executeQueryAll(cleanSql, params);
        return results[0] || undefined;
      },
      run(...params: any[]): { changes: number } {
        return self.executeRun(cleanSql, params);
      }
    };
  }

  private executeQueryAll(sql: string, params: any[]): any[] {
    const lower = sql.toLowerCase();

    // 1. SELECT FROM users
    if (lower.includes('from users')) {
      if (lower.includes('where email = ?')) {
        return this.data.users.filter(u => u.email === params[0]);
      }
      if (lower.includes('where id = ?')) {
        return this.data.users.filter(u => u.id === params[0]);
      }
      if (lower.includes('where role = "user"') || lower.includes("where role = 'user'")) {
        return this.data.users.filter(u => u.role === 'user');
      }
      if (lower.includes('limit 1')) {
        return this.data.users.slice(0, 1);
      }
      return [...this.data.users];
    }

    // 2. SELECT FROM addresses
    if (lower.includes('from addresses')) {
      if (lower.includes('where user_id = ?')) {
        return this.data.addresses.filter(a => a.user_id === params[0]);
      }
      if (lower.includes('where id = ?')) {
        return this.data.addresses.filter(a => a.id === params[0]);
      }
      return [...this.data.addresses];
    }

    // 3. SELECT FROM categories
    if (lower.includes('from categories')) {
      return [...this.data.categories].sort((a, b) => a.name.localeCompare(b.name));
    }

    // 4. SELECT FROM medicines
    if (lower.includes('from medicines')) {
      let list = [...this.data.medicines];

      // Join category name
      list = list.map(m => {
        const cat = this.data.categories.find(c => c.id === m.category_id);
        return {
          ...m,
          category_name: cat ? cat.name : '',
          category_slug: cat ? cat.slug : ''
        };
      });

      if (lower.includes('where m.id = ?') || lower.includes('where id = ?')) {
        return list.filter(m => m.id === params[0]);
      }

      let pIdx = 0;
      if (sql.includes('LIKE ?')) {
        const pattern = String(params[pIdx] || '').replace(/%/g, '').toLowerCase();
        list = list.filter(m =>
          m.name.toLowerCase().includes(pattern) ||
          m.generic_name.toLowerCase().includes(pattern) ||
          m.brand.toLowerCase().includes(pattern) ||
          m.description.toLowerCase().includes(pattern)
        );
        pIdx += 4;
      }

      if (lower.includes('category_id = ?')) {
        const catId = params[pIdx++];
        list = list.filter(m => m.category_id === catId || m.category_slug === catId);
      }

      if (lower.includes('prescription_required = ?')) {
        const req = params[pIdx++];
        list = list.filter(m => Number(m.prescription_required) === Number(req));
      }

      if (lower.includes('availability = 1')) {
        list = list.filter(m => Number(m.availability) === 1);
      }

      if (lower.includes('price * (1 - m.discount/100.0)) >= ?')) {
        const minP = params[pIdx++];
        list = list.filter(m => (m.price * (1 - m.discount / 100)) >= minP);
      }

      if (lower.includes('price * (1 - m.discount/100.0)) <= ?')) {
        const maxP = params[pIdx++];
        list = list.filter(m => (m.price * (1 - m.discount / 100)) <= maxP);
      }

      if (lower.includes('order by (m.price * (1 - m.discount/100.0)) asc')) {
        list.sort((a, b) => (a.price * (1 - a.discount / 100)) - (b.price * (1 - b.discount / 100)));
      } else if (lower.includes('order by (m.price * (1 - m.discount/100.0)) desc')) {
        list.sort((a, b) => (b.price * (1 - b.discount / 100)) - (a.price * (1 - a.discount / 100)));
      } else if (lower.includes('order by m.discount desc')) {
        list.sort((a, b) => b.discount - a.discount);
      } else {
        list.sort((a, b) => a.name.localeCompare(b.name));
      }

      return list;
    }

    // 5. SELECT FROM pharmacies
    if (lower.includes('from pharmacies')) {
      if (lower.includes('where id = ?')) {
        return this.data.pharmacies.filter(p => p.id === params[0]);
      }
      if (lower.includes('where is_open = 1')) {
        return this.data.pharmacies.filter(p => Number(p.is_open) === 1);
      }
      let list = [...this.data.pharmacies];
      if (sql.includes('LIKE ?')) {
        const pattern = String(params[0] || '').replace(/%/g, '').toLowerCase();
        list = list.filter(p =>
          p.name.toLowerCase().includes(pattern) ||
          p.address.toLowerCase().includes(pattern) ||
          p.area.toLowerCase().includes(pattern)
        );
      }
      return list;
    }

    // 6. SELECT FROM pharmacy_medicines
    if (lower.includes('from pharmacy_medicines')) {
      if (lower.includes('where pm.pharmacy_id = ?') || lower.includes('where pharmacy_id = ?')) {
        const phId = params[0];
        return this.data.pharmacy_medicines
          .filter(pm => pm.pharmacy_id === phId)
          .map(pm => {
            const med = this.data.medicines.find(m => m.id === pm.medicine_id);
            return { ...pm, ...(med || {}) };
          });
      }
      if (lower.includes('where pm.medicine_id = ?') || lower.includes('where medicine_id = ?')) {
        const medId = params[0];
        return this.data.pharmacy_medicines
          .filter(pm => pm.medicine_id === medId && pm.stock > 0)
          .map(pm => {
            const ph = this.data.pharmacies.find(p => p.id === pm.pharmacy_id);
            return {
              ...pm,
              pharmacy_name: ph ? ph.name : '',
              estimated_delivery_min: ph ? ph.estimated_delivery_min : 25,
              lat: ph ? ph.lat : 12.9716,
              lng: ph ? ph.lng : 77.5946
            };
          });
      }
      if (lower.includes('where stock < 20')) {
        return this.data.pharmacy_medicines.filter(pm => pm.stock < 20);
      }
      return [...this.data.pharmacy_medicines];
    }

    // 7. SELECT FROM prescriptions
    if (lower.includes('from prescriptions')) {
      let list = [...this.data.prescriptions];
      list = list.map(p => {
        const usr = this.data.users.find(u => u.id === p.user_id);
        const ord = this.data.orders.find(o => o.id === p.order_id);
        return {
          ...p,
          user_name: usr ? usr.name : '',
          user_email: usr ? usr.email : '',
          user_phone: usr ? usr.phone : '',
          order_number: ord ? ord.order_number : ''
        };
      });

      if (lower.includes('where user_id = ?')) {
        list = list.filter(p => p.user_id === params[0]);
      }
      if (lower.includes('where id = ?')) {
        list = list.filter(p => p.id === params[0]);
      }
      if (lower.includes('where order_id = ?')) {
        list = list.filter(p => p.order_id === params[0]);
      }
      if (lower.includes('status = "pending review"')) {
        list = list.filter(p => p.status === 'Pending Review');
      }
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return list;
    }

    // 8. SELECT FROM cart_items
    if (lower.includes('from cart_items')) {
      if (lower.includes('where user_id = ?') || lower.includes('where ci.user_id = ?')) {
        const userId = params[0];
        const userCart = this.data.cart_items.filter(c => c.user_id === userId);
        return userCart.map(ci => {
          const med = this.data.medicines.find(m => m.id === ci.medicine_id);
          const ph = this.data.pharmacies.find(p => p.id === ci.pharmacy_id);
          return {
            ...ci,
            medicine_name: med ? med.name : '',
            generic_name: med ? med.generic_name : '',
            brand: med ? med.brand : '',
            strength: med ? med.strength : '',
            price: med ? med.price : 0,
            discount: med ? med.discount : 0,
            image: med ? med.image : '',
            prescription_required: med ? med.prescription_required : false,
            pharmacy_name: ph ? ph.name : '',
            estimated_delivery_min: ph ? ph.estimated_delivery_min : 25
          };
        });
      }
      return [...this.data.cart_items];
    }

    // 9. SELECT FROM orders
    if (lower.includes('from orders')) {
      let list = [...this.data.orders];
      list = list.map(o => {
        const usr = this.data.users.find(u => u.id === o.user_id);
        const ph = this.data.pharmacies.find(p => p.id === o.pharmacy_id);
        const addr = this.data.addresses.find(a => a.id === o.address_id);
        return {
          ...o,
          customer_name: usr ? usr.name : '',
          customer_email: usr ? usr.email : '',
          pharmacy_name: ph ? ph.name : '',
          pharmacy_logo: ph ? ph.logo : '',
          pharmacy_address: ph ? ph.address : '',
          pharmacy_phone: ph ? ph.phone : '',
          estimated_delivery_min: ph ? ph.estimated_delivery_min : 25,
          full_name: addr ? addr.full_name : '',
          delivery_name: addr ? addr.full_name : '',
          delivery_phone: addr ? addr.phone : '',
          house_no: addr ? addr.house_no : '',
          street: addr ? addr.street : '',
          area: addr ? addr.area : '',
          city: addr ? addr.city : '',
          state: addr ? addr.state : '',
          pincode: addr ? addr.pincode : ''
        };
      });

      if (lower.includes('where o.user_id = ?') || lower.includes('where user_id = ?')) {
        list = list.filter(o => o.user_id === params[0]);
      }
      if (lower.includes('where o.id = ? or o.order_number = ?') || lower.includes('where id = ?')) {
        list = list.filter(o => o.id === params[0] || o.order_number === params[0] || o.id === params[1] || o.order_number === params[1]);
      }
      if (lower.includes('where o.order_status = ?') || lower.includes('where order_status = ?')) {
        list = list.filter(o => o.order_status === params[0]);
      }
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return list;
    }

    // 10. SELECT FROM order_items
    if (lower.includes('from order_items')) {
      if (lower.includes('where oi.order_id = ?') || lower.includes('where order_id = ?')) {
        const orderId = params[0];
        return this.data.order_items
          .filter(oi => oi.order_id === orderId)
          .map(oi => {
            const med = this.data.medicines.find(m => m.id === oi.medicine_id);
            return {
              ...oi,
              medicine_name: med ? med.name : '',
              generic_name: med ? med.generic_name : '',
              brand: med ? med.brand : '',
              image: med ? med.image : '',
              strength: med ? med.strength : ''
            };
          });
      }
      return [...this.data.order_items];
    }

    // 11. SELECT FROM delivery_tracking
    if (lower.includes('from delivery_tracking')) {
      if (lower.includes('where order_id = ?')) {
        return this.data.delivery_tracking.filter(t => t.order_id === params[0]);
      }
      return [...this.data.delivery_tracking];
    }

    // 12. SELECT FROM notifications
    if (lower.includes('from notifications')) {
      if (lower.includes('where user_id = ? and is_read = 0')) {
        return [{ count: this.data.notifications.filter(n => n.user_id === params[0] && Number(n.is_read) === 0).length }];
      }
      if (lower.includes('where user_id = ?')) {
        const userNotifs = this.data.notifications.filter(n => n.user_id === params[0]);
        userNotifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return userNotifs;
      }
      return [...this.data.notifications];
    }

    // Aggregate Analytics queries
    if (lower.includes('count(*) as count from orders')) {
      if (lower.includes("date(created_at) = date('now')")) {
        const today = new Date().toISOString().slice(0, 10);
        return [{ count: this.data.orders.filter(o => o.created_at?.startsWith(today)).length }];
      }
      return [{ count: this.data.orders.length }];
    }

    if (lower.includes('sum(total_amount) as total from orders')) {
      const sum = this.data.orders
        .filter(o => o.order_status !== 'Cancelled')
        .reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
      return [{ total: sum }];
    }

    if (lower.includes('order_status as name, count(*) as count')) {
      const statusMap: Record<string, number> = {};
      this.data.orders.forEach(o => {
        statusMap[o.order_status] = (statusMap[o.order_status] || 0) + 1;
      });
      return Object.entries(statusMap).map(([name, count]) => ({ name, count }));
    }

    if (lower.includes('group by date(created_at)')) {
      const dateMap: Record<string, { orders: number; revenue: number }> = {};
      this.data.orders.forEach(o => {
        const date = (o.created_at || new Date().toISOString()).slice(0, 10);
        if (!dateMap[date]) dateMap[date] = { orders: 0, revenue: 0 };
        dateMap[date].orders += 1;
        if (o.order_status !== 'Cancelled') {
          dateMap[date].revenue += o.total_amount || 0;
        }
      });
      return Object.entries(dateMap).map(([date, val]) => ({ date, orders: val.orders, revenue: val.revenue }));
    }

    if (lower.includes('sum(oi.quantity) as total_sold')) {
      const medMap: Record<string, { total_sold: number; revenue: number }> = {};
      this.data.order_items.forEach(oi => {
        if (!medMap[oi.medicine_id]) medMap[oi.medicine_id] = { total_sold: 0, revenue: 0 };
        medMap[oi.medicine_id].total_sold += oi.quantity;
        medMap[oi.medicine_id].revenue += oi.quantity * oi.unit_price;
      });
      return Object.entries(medMap)
        .map(([medId, val]) => {
          const med = this.data.medicines.find(m => m.id === medId);
          return { name: med ? med.name : 'Medicine', total_sold: val.total_sold, revenue: val.revenue };
        })
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 5);
    }

    return [];
  }

  private executeRun(sql: string, params: any[]): { changes: number } {
    const lower = sql.toLowerCase();

    if (lower.includes('insert into users')) {
      this.data.users.push({
        id: params[0],
        name: params[1],
        email: params[2],
        password_hash: params[3],
        role: params[4] || 'user',
        phone: params[5] || '',
        avatar: params[6] || '',
        created_at: new Date().toISOString()
      });
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('insert into addresses')) {
      this.data.addresses.push({
        id: params[0],
        user_id: params[1],
        label: params[2],
        full_name: params[3],
        phone: params[4],
        house_no: params[5],
        street: params[6],
        area: params[7],
        city: params[8],
        state: params[9],
        pincode: params[10],
        lat: params[11],
        lng: params[12],
        is_default: params[13] || 0
      });
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('insert into categories')) {
      this.data.categories.push({
        id: params[0],
        name: params[1],
        slug: params[2],
        icon: params[3],
        description: params[4]
      });
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('insert into pharmacies')) {
      this.data.pharmacies.push({
        id: params[0],
        name: params[1],
        logo: params[2],
        rating: params[3],
        address: params[4],
        city: params[5],
        area: params[6],
        pincode: params[7],
        lat: params[8],
        lng: params[9],
        phone: params[10],
        is_open: params[11],
        estimated_delivery_min: params[12]
      });
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('insert into medicines')) {
      this.data.medicines.push({
        id: params[0],
        name: params[1],
        generic_name: params[2],
        brand: params[3],
        category_id: params[4],
        strength: params[5],
        manufacturer: params[6],
        price: params[7],
        discount: params[8],
        availability: params[9],
        prescription_required: params[10],
        description: params[11],
        uses: params[12],
        warnings: params[13],
        storage_info: params[14],
        image: params[15]
      });
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('insert into pharmacy_medicines')) {
      this.data.pharmacy_medicines.push({
        id: params[0],
        pharmacy_id: params[1],
        medicine_id: params[2],
        stock: params[3],
        price_override: params[4] || null
      });
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('insert into prescriptions')) {
      this.data.prescriptions.push({
        id: params[0],
        user_id: params[1],
        file_path: params[2],
        file_name: params[3],
        file_type: params[4],
        notes: params[5],
        status: params[6] || 'Pending Review',
        created_at: new Date().toISOString()
      });
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('insert into cart_items')) {
      this.data.cart_items.push({
        id: params[0],
        user_id: params[1],
        medicine_id: params[2],
        pharmacy_id: params[3],
        quantity: params[4]
      });
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('insert into orders')) {
      this.data.orders.push({
        id: params[0],
        order_number: params[1],
        user_id: params[2],
        pharmacy_id: params[3],
        address_id: params[4],
        total_amount: params[5],
        subtotal: params[6],
        delivery_fee: params[7],
        discount_amount: params[8],
        payment_method: params[9],
        payment_status: params[10] || 'Paid',
        order_status: params[11] || 'Placed',
        created_at: new Date().toISOString()
      });
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('insert into order_items')) {
      this.data.order_items.push({
        id: params[0],
        order_id: params[1],
        medicine_id: params[2],
        quantity: params[3],
        unit_price: params[4],
        prescription_required: params[5]
      });
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('insert into delivery_tracking')) {
      this.data.delivery_tracking.push({
        id: params[0],
        order_id: params[1],
        step: params[2],
        status: params[3],
        driver_name: params[4],
        driver_phone: params[5],
        driver_lat: params[6],
        driver_lng: params[7],
        timestamp: new Date().toISOString()
      });
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('insert into notifications')) {
      this.data.notifications.push({
        id: params[0],
        user_id: params[1],
        title: params[2],
        message: params[3],
        is_read: 0,
        type: params[4] || 'info',
        created_at: new Date().toISOString()
      });
      this.save();
      return { changes: 1 };
    }

    // UPDATE Queries
    if (lower.includes('update cart_items set quantity = ?')) {
      const qty = params[0];
      const id = params[1];
      const item = this.data.cart_items.find(c => c.id === id);
      if (item) item.quantity = qty;
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('update prescriptions set order_id = ?')) {
      const orderId = params[0];
      const prescId = params[1];
      const presc = this.data.prescriptions.find(p => p.id === prescId);
      if (presc) presc.order_id = orderId;
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('update prescriptions set status = ?')) {
      const status = params[0];
      const notes = params[1];
      const id = params[2];
      const presc = this.data.prescriptions.find(p => p.id === id);
      if (presc) {
        presc.status = status;
        presc.pharmacist_notes = notes;
      }
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('update orders set order_status = ?')) {
      const status = params[0];
      const id = params[1];
      const ord = this.data.orders.find(o => o.id === id);
      if (ord) ord.order_status = status;
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('update delivery_tracking set status = "completed"')) {
      const id = params[0];
      this.data.delivery_tracking.forEach(t => {
        if (t.order_id === id) t.status = 'completed';
      });
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('update notifications set is_read = 1')) {
      if (lower.includes('where id = ?')) {
        const id = params[0];
        const n = this.data.notifications.find(item => item.id === id);
        if (n) n.is_read = 1;
      } else {
        const userId = params[0];
        this.data.notifications.forEach(n => {
          if (n.user_id === userId) n.is_read = 1;
        });
      }
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('update users set name =')) {
      const userId = params[3];
      const u = this.data.users.find(item => item.id === userId);
      if (u) {
        if (params[0]) u.name = params[0];
        if (params[1]) u.phone = params[1];
        if (params[2]) u.avatar = params[2];
      }
      this.save();
      return { changes: 1 };
    }

    // DELETE Queries
    if (lower.includes('delete from cart_items')) {
      if (lower.includes('where id = ?')) {
        this.data.cart_items = this.data.cart_items.filter(c => c.id !== params[0]);
      } else if (lower.includes('where user_id = ?')) {
        this.data.cart_items = this.data.cart_items.filter(c => c.user_id !== params[0]);
      }
      this.save();
      return { changes: 1 };
    }

    if (lower.includes('delete from medicines')) {
      this.data.medicines = this.data.medicines.filter(m => m.id !== params[0]);
      this.save();
      return { changes: 1 };
    }

    return { changes: 0 };
  }
}

const db = new MemoryDb();

export function initDb() {
  // DB initialized
}

export default db;
