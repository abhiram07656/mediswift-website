import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Function to generate formatted Order ID (e.g. #ORD-20260822-00142)
function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${dateStr}-${randomDigits}`;
}

// POST /api/orders/place
router.post('/place', authenticateToken, (req: AuthRequest, res) => {
  const { pharmacy_id, address_id, payment_method, items, prescription_id } = req.body;
  const userId = req.user?.id;

  if (!pharmacy_id || !address_id || !payment_method || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Pharmacy, delivery address, payment method and items are required' });
  }

  // Calculate totals
  let subtotal = 0;
  let hasPrescriptionRequired = false;

  const orderItemsData = items.map((item: any) => {
    const med = db.prepare('SELECT price, discount, prescription_required FROM medicines WHERE id = ?').get(item.medicine_id) as any;
    if (!med) {
      throw new Error(`Medicine ${item.medicine_id} not found`);
    }
    const unitPrice = med.price * (1 - med.discount / 100.0);
    subtotal += unitPrice * item.quantity;
    if (med.prescription_required) {
      hasPrescriptionRequired = true;
    }
    return {
      medicine_id: item.medicine_id,
      quantity: item.quantity,
      unit_price: Math.round(unitPrice * 100) / 100,
      prescription_required: med.prescription_required
    };
  });

  const delivery_fee = 29.00;
  const discount_amount = subtotal > 500 ? 50.00 : 0;
  const total_amount = Math.round((subtotal + delivery_fee - discount_amount) * 100) / 100;

  const orderId = 'ord-' + uuidv4().slice(0, 8);
  const orderNumber = generateOrderNumber();

  // Create Order
  db.prepare(`
    INSERT INTO orders (id, order_number, user_id, pharmacy_id, address_id, total_amount, subtotal, delivery_fee, discount_amount, payment_method, payment_status, order_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', 'Placed', CURRENT_TIMESTAMP)
  `).run(
    orderId,
    orderNumber,
    userId,
    pharmacy_id,
    address_id,
    total_amount,
    subtotal,
    delivery_fee,
    discount_amount,
    payment_method
  );

  // Insert Order Items
  const insertItem = db.prepare(`
    INSERT INTO order_items (id, order_id, medicine_id, quantity, unit_price, prescription_required)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const item of orderItemsData) {
    insertItem.run(uuidv4(), orderId, item.medicine_id, item.quantity, item.unit_price, item.prescription_required);
  }

  // Link Prescription if provided
  if (prescription_id) {
    db.prepare('UPDATE prescriptions SET order_id = ? WHERE id = ? AND user_id = ?').run(orderId, prescription_id, userId);
  }

  // Initialize Delivery Tracking Steps
  const pharmacy = db.prepare('SELECT lat, lng FROM pharmacies WHERE id = ?').get(pharmacy_id) as any;
  const address = db.prepare('SELECT lat, lng FROM addresses WHERE id = ?').get(address_id) as any;

  const phLat = pharmacy ? pharmacy.lat : 12.9340;
  const phLng = pharmacy ? pharmacy.lng : 77.6220;
  const userLat = address ? address.lat : 12.9352;
  const userLng = address ? address.lng : 77.6245;

  const driverNames = ['Ramesh Kumar', 'Suresh Patel', 'Vikram Singh', 'Anand Joshi'];
  const randomDriver = driverNames[Math.floor(Math.random() * driverNames.length)];
  const randomDriverPhone = '+91 98765 ' + Math.floor(10000 + Math.random() * 90000);

  const trackingSteps = [
    { step: 'Order Placed', status: 'completed', lat: phLat, lng: phLng },
    { step: 'Pharmacy Confirmed', status: 'pending', lat: phLat, lng: phLng },
    { step: 'Medicine Packed', status: 'pending', lat: phLat + 0.0005, lng: phLng + 0.0005 },
    { step: 'Out for Delivery', status: 'pending', lat: phLat + 0.001, lng: phLng + 0.001 },
    { step: 'Delivered', status: 'pending', lat: userLat, lng: userLng }
  ];

  const insertTrack = db.prepare(`
    INSERT INTO delivery_tracking (id, order_id, step, status, driver_name, driver_phone, driver_lat, driver_lng)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of trackingSteps) {
    insertTrack.run(uuidv4(), orderId, t.step, t.status, randomDriver, randomDriverPhone, t.lat, t.lng);
  }

  // Clear user cart
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);

  // Send Order Placed Notification
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type)
    VALUES (?, ?, ?, ?, 'order')
  `).run(
    uuidv4(),
    userId,
    'Order Placed Successfully! 🎉',
    `Your order #${orderNumber} of ₹${total_amount} has been placed successfully.`
  );

  const placedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  res.status(201).json({
    message: 'Order placed successfully',
    order: placedOrder
  });
});

// GET /api/orders/my-orders
router.get('/my-orders', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const orders = db.prepare(`
    SELECT o.*, p.name as pharmacy_name, p.logo as pharmacy_logo, a.full_name, a.street, a.city, a.pincode
    FROM orders o
    JOIN pharmacies p ON o.pharmacy_id = p.id
    JOIN addresses a ON o.address_id = a.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(userId) as any[];

  const enrichedOrders = orders.map(ord => {
    const items = db.prepare(`
      SELECT oi.*, m.name as medicine_name, m.generic_name, m.brand, m.image, m.strength
      FROM order_items oi
      JOIN medicines m ON oi.medicine_id = m.id
      WHERE oi.order_id = ?
    `).all(ord.id);

    return {
      ...ord,
      items
    };
  });

  res.json(enrichedOrders);
});

// GET /api/orders/:id
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const order = db.prepare(`
    SELECT o.*, p.name as pharmacy_name, p.address as pharmacy_address, p.phone as pharmacy_phone, p.estimated_delivery_min,
           a.full_name as delivery_name, a.phone as delivery_phone, a.house_no, a.street, a.area, a.city, a.state, a.pincode, a.lat as user_lat, a.lng as user_lng
    FROM orders o
    JOIN pharmacies p ON o.pharmacy_id = p.id
    JOIN addresses a ON o.address_id = a.id
    WHERE o.id = ? OR o.order_number = ?
  `).get(id, id) as any;

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Ensure owner or admin
  if (order.user_id !== req.user?.id && req.user?.role !== 'admin' && req.user?.role !== 'pharmacist') {
    return res.status(403).json({ error: 'Unauthorized access to order' });
  }

  const items = db.prepare(`
    SELECT oi.*, m.name as medicine_name, m.generic_name, m.brand, m.image, m.strength
    FROM order_items oi
    JOIN medicines m ON oi.medicine_id = m.id
    WHERE oi.order_id = ?
  `).all(order.id);

  const tracking = db.prepare(`
    SELECT * FROM delivery_tracking WHERE order_id = ? ORDER BY timestamp ASC
  `).all(order.id);

  const prescription = db.prepare('SELECT * FROM prescriptions WHERE order_id = ?').get(order.id);

  res.json({
    ...order,
    items,
    tracking,
    prescription
  });
});

// GET /api/orders/:id/tracking
router.get('/:id/tracking', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const order = db.prepare(`
    SELECT o.id, o.order_number, o.order_status, o.created_at,
           p.name as pharmacy_name, p.lat as pharmacy_lat, p.lng as pharmacy_lng, p.estimated_delivery_min,
           a.lat as user_lat, a.lng as user_lng, a.street, a.area, a.city
    FROM orders o
    JOIN pharmacies p ON o.pharmacy_id = p.id
    JOIN addresses a ON o.address_id = a.id
    WHERE o.id = ? OR o.order_number = ?
  `).get(id, id) as any;

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const steps = db.prepare('SELECT * FROM delivery_tracking WHERE order_id = ? ORDER BY id ASC').all(order.id) as any[];

  res.json({
    order,
    steps,
    current_driver: steps.length > 0 ? {
      name: steps[0].driver_name,
      phone: steps[0].driver_phone,
      lat: steps[0].driver_lat,
      lng: steps[0].driver_lng
    } : null
  });
});

export default router;
