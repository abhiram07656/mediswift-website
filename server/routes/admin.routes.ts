import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Apply auth & requireAdmin middleware to all /api/admin routes
router.use(authenticateToken, requireAdmin);

// GET /api/admin/analytics
router.get('/analytics', (_req, res) => {
  const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
  const todayOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = DATE('now')").get() as any;
  const totalRevenue = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE order_status != "Cancelled"').get() as any;
  const activeUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "user"').get() as any;
  const pendingPrescriptions = db.prepare('SELECT COUNT(*) as count FROM prescriptions WHERE status = "Pending Review"').get() as any;
  const totalMedicines = db.prepare('SELECT COUNT(*) as count FROM medicines').get() as any;
  const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM pharmacy_medicines WHERE stock < 20').get() as any;

  // Order status distribution
  const statusDistribution = db.prepare(`
    SELECT order_status as name, COUNT(*) as count
    FROM orders
    GROUP BY order_status
  `).all();

  // Daily revenue & order counts for chart
  const dailyTrends = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue
    FROM orders
    GROUP BY DATE(created_at)
    ORDER BY date ASC
    LIMIT 14
  `).all();

  // Top selling medicines
  const topMedicines = db.prepare(`
    SELECT m.name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.unit_price) as revenue
    FROM order_items oi
    JOIN medicines m ON oi.medicine_id = m.id
    GROUP BY oi.medicine_id
    ORDER BY total_sold DESC
    LIMIT 5
  `).all();

  res.json({
    metrics: {
      totalOrders: totalOrders.count,
      todayOrders: todayOrders.count,
      totalRevenue: totalRevenue.total || 0,
      activeUsers: activeUsers.count,
      pendingPrescriptions: pendingPrescriptions.count,
      totalMedicines: totalMedicines.count,
      lowStockCount: lowStockCount.count
    },
    charts: {
      statusDistribution,
      dailyTrends,
      topMedicines
    }
  });
});

// GET /api/admin/medicines
router.get('/medicines', (_req, res) => {
  const medicines = db.prepare(`
    SELECT m.*, c.name as category_name
    FROM medicines m
    LEFT JOIN categories c ON m.category_id = c.id
    ORDER BY m.name ASC
  `).all();
  res.json(medicines);
});

// POST /api/admin/medicines
router.post('/medicines', (req, res) => {
  const { name, generic_name, brand, category_id, strength, manufacturer, price, discount, availability, prescription_required, description, uses, warnings, storage_info, image } = req.body;

  if (!name || !generic_name || !brand || !category_id || !price) {
    return res.status(400).json({ error: 'Name, generic name, brand, category and price are required' });
  }

  const id = 'med-' + uuidv4().slice(0, 8);
  const defaultImage = image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';

  db.prepare(`
    INSERT INTO medicines (id, name, generic_name, brand, category_id, strength, manufacturer, price, discount, availability, prescription_required, description, uses, warnings, storage_info, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, generic_name, brand, category_id, strength || '500mg', manufacturer || 'Generic Pharma',
    price, discount || 0, availability ? 1 : 0, prescription_required ? 1 : 0,
    description || '', uses || '', warnings || '', storage_info || '', defaultImage
  );

  // Add default stock to all pharmacies
  const pharmacies = db.prepare('SELECT id FROM pharmacies').all() as any[];
  const insertPm = db.prepare('INSERT INTO pharmacy_medicines (id, pharmacy_id, medicine_id, stock) VALUES (?, ?, ?, ?)');
  for (const ph of pharmacies) {
    insertPm.run(uuidv4(), ph.id, id, 50);
  }

  const newMedicine = db.prepare('SELECT * FROM medicines WHERE id = ?').get(id);
  res.status(201).json({ message: 'Medicine created successfully', medicine: newMedicine });
});

// PUT /api/admin/medicines/:id
router.put('/medicines/:id', (req, res) => {
  const { id } = req.params;
  const { name, generic_name, brand, category_id, strength, manufacturer, price, discount, availability, prescription_required, description, uses, warnings, storage_info, image } = req.body;

  db.prepare(`
    UPDATE medicines SET
      name = COALESCE(?, name),
      generic_name = COALESCE(?, generic_name),
      brand = COALESCE(?, brand),
      category_id = COALESCE(?, category_id),
      strength = COALESCE(?, strength),
      manufacturer = COALESCE(?, manufacturer),
      price = COALESCE(?, price),
      discount = COALESCE(?, discount),
      availability = COALESCE(?, availability),
      prescription_required = COALESCE(?, prescription_required),
      description = COALESCE(?, description),
      uses = COALESCE(?, uses),
      warnings = COALESCE(?, warnings),
      storage_info = COALESCE(?, storage_info),
      image = COALESCE(?, image)
    WHERE id = ?
  `).run(name, generic_name, brand, category_id, strength, manufacturer, price, discount, availability !== undefined ? (availability ? 1 : 0) : null, prescription_required !== undefined ? (prescription_required ? 1 : 0) : null, description, uses, warnings, storage_info, image, id);

  const updated = db.prepare('SELECT * FROM medicines WHERE id = ?').get(id);
  res.json({ message: 'Medicine updated successfully', medicine: updated });
});

// DELETE /api/admin/medicines/:id
router.delete('/medicines/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM medicines WHERE id = ?').run(id);
  db.prepare('DELETE FROM pharmacy_medicines WHERE medicine_id = ?').run(id);
  res.json({ message: 'Medicine deleted successfully' });
});

// GET /api/admin/pharmacies
router.get('/pharmacies', (_req, res) => {
  const pharmacies = db.prepare('SELECT * FROM pharmacies ORDER BY name ASC').all();
  res.json(pharmacies);
});

// POST /api/admin/pharmacies
router.post('/pharmacies', (req, res) => {
  const { name, logo, rating, address, city, area, pincode, lat, lng, phone, is_open, estimated_delivery_min } = req.body;

  if (!name || !address || !city || !area || !phone) {
    return res.status(400).json({ error: 'Name, address, city, area and phone are required' });
  }

  const id = 'ph-' + uuidv4().slice(0, 8);
  const defaultLogo = logo || 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=150&q=80';

  db.prepare(`
    INSERT INTO pharmacies (id, name, logo, rating, address, city, area, pincode, lat, lng, phone, is_open, estimated_delivery_min)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, defaultLogo, rating || 4.5, address, city, area, pincode || '560001',
    lat || 12.9716, lng || 77.5946, phone, is_open ? 1 : 0, estimated_delivery_min || 25
  );

  const newPharmacy = db.prepare('SELECT * FROM pharmacies WHERE id = ?').get(id);
  res.status(201).json({ message: 'Pharmacy created successfully', pharmacy: newPharmacy });
});

// PUT /api/admin/pharmacies/:id
router.put('/pharmacies/:id', (req, res) => {
  const { id } = req.params;
  const { name, logo, rating, address, city, area, pincode, lat, lng, phone, is_open, estimated_delivery_min } = req.body;

  db.prepare(`
    UPDATE pharmacies SET
      name = COALESCE(?, name),
      logo = COALESCE(?, logo),
      rating = COALESCE(?, rating),
      address = COALESCE(?, address),
      city = COALESCE(?, city),
      area = COALESCE(?, area),
      pincode = COALESCE(?, pincode),
      lat = COALESCE(?, lat),
      lng = COALESCE(?, lng),
      phone = COALESCE(?, phone),
      is_open = COALESCE(?, is_open),
      estimated_delivery_min = COALESCE(?, estimated_delivery_min)
    WHERE id = ?
  `).run(name, logo, rating, address, city, area, pincode, lat, lng, phone, is_open !== undefined ? (is_open ? 1 : 0) : null, estimated_delivery_min, id);

  const updated = db.prepare('SELECT * FROM pharmacies WHERE id = ?').get(id);
  res.json({ message: 'Pharmacy updated successfully', pharmacy: updated });
});

// GET /api/admin/orders
router.get('/orders', (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT o.*, u.name as customer_name, u.email as customer_email, p.name as pharmacy_name, a.street, a.city, a.phone as delivery_phone
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN pharmacies p ON o.pharmacy_id = p.id
    JOIN addresses a ON o.address_id = a.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'All') {
    query += ' AND o.order_status = ?';
    params.push(status);
  }

  query += ' ORDER BY o.created_at DESC';

  const orders = db.prepare(query).all(...params) as any[];

  const enriched = orders.map(ord => {
    const items = db.prepare(`
      SELECT oi.*, m.name as medicine_name, m.generic_name
      FROM order_items oi
      JOIN medicines m ON oi.medicine_id = m.id
      WHERE oi.order_id = ?
    `).all(ord.id);

    const prescription = db.prepare('SELECT * FROM prescriptions WHERE order_id = ?').get(ord.id);

    return {
      ...ord,
      items,
      prescription
    };
  });

  res.json(enriched);
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', (req: AuthRequest, res) => {
  const { id } = req.params;
  const { order_status } = req.body;

  if (!order_status) {
    return res.status(400).json({ error: 'order_status is required' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  db.prepare('UPDATE orders SET order_status = ? WHERE id = ?').run(order_status, id);

  // Update tracking steps status
  if (order_status === 'Confirmed') {
    db.prepare('UPDATE delivery_tracking SET status = "completed" WHERE order_id = ? AND step = "Pharmacy Confirmed"').run(id);
  } else if (order_status === 'Preparing') {
    db.prepare('UPDATE delivery_tracking SET status = "completed" WHERE order_id = ? AND step IN ("Pharmacy Confirmed", "Medicine Packed")').run(id);
  } else if (order_status === 'Out for Delivery') {
    db.prepare('UPDATE delivery_tracking SET status = "completed" WHERE order_id = ? AND step IN ("Pharmacy Confirmed", "Medicine Packed", "Out for Delivery")').run(id);
  } else if (order_status === 'Delivered') {
    db.prepare('UPDATE delivery_tracking SET status = "completed" WHERE order_id = ?').run(id);
  }

  // Send Notification to customer
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type)
    VALUES (?, ?, ?, ?, 'order')
  `).run(
    uuidv4(),
    order.user_id,
    `Order Status Updated: ${order_status}`,
    `Your order #${order.order_number} status has been updated to "${order_status}".`
  );

  const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  res.json({ message: 'Order status updated successfully', order: updatedOrder });
});

// GET /api/admin/prescriptions
router.get('/prescriptions', (_req, res) => {
  const prescriptions = db.prepare(`
    SELECT p.*, u.name as user_name, u.email as user_email, u.phone as user_phone, o.order_number
    FROM prescriptions p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN orders o ON p.order_id = o.id
    ORDER BY p.created_at DESC
  `).all();
  res.json(prescriptions);
});

// PUT /api/admin/prescriptions/:id/status
router.put('/prescriptions/:id/status', (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, pharmacist_notes } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  const presc = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id) as any;
  if (!presc) {
    return res.status(404).json({ error: 'Prescription not found' });
  }

  db.prepare(`
    UPDATE prescriptions SET status = ?, pharmacist_notes = ? WHERE id = ?
  `).run(status, pharmacist_notes || '', id);

  // Send Notification to user
  let notifTitle = 'Prescription Review Updated';
  if (status === 'Verified') notifTitle = 'Prescription Approved! ✅';
  else if (status === 'Rejected') notifTitle = 'Prescription Rejected ❌';
  else if (status === 'Needs Clarification') notifTitle = 'Prescription Clarification Required ⚠️';

  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type)
    VALUES (?, ?, ?, ?, 'prescription')
  `).run(
    uuidv4(),
    presc.user_id,
    notifTitle,
    `Pharmacist review status for your prescription: "${status}". Note: ${pharmacist_notes || 'None'}`
  );

  const updated = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);
  res.json({ message: 'Prescription status updated successfully', prescription: updated });
});

export default router;
