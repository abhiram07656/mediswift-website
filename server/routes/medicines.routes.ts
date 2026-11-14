import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/medicines/categories
router.get('/categories', (_req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
  res.json(categories);
});

// GET /api/medicines
router.get('/', (req, res) => {
  const { search, category, prescription, available, minPrice, maxPrice, sort } = req.query;

  let query = `
    SELECT m.*, c.name as category_name, c.slug as category_slug
    FROM medicines m
    LEFT JOIN categories c ON m.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    query += ` AND (m.name LIKE ? OR m.generic_name LIKE ? OR m.brand LIKE ? OR m.description LIKE ?)`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  if (category) {
    query += ` AND (m.category_id = ? OR c.slug = ?)`;
    params.push(category, category);
  }

  if (prescription !== undefined && prescription !== '') {
    query += ` AND m.prescription_required = ?`;
    params.push(prescription === 'true' || prescription === '1' ? 1 : 0);
  }

  if (available === 'true') {
    query += ` AND m.availability = 1`;
  }

  if (minPrice) {
    query += ` AND (m.price * (1 - m.discount/100.0)) >= ?`;
    params.push(parseFloat(minPrice as string));
  }

  if (maxPrice) {
    query += ` AND (m.price * (1 - m.discount/100.0)) <= ?`;
    params.push(parseFloat(maxPrice as string));
  }

  if (sort === 'price_asc') {
    query += ` ORDER BY (m.price * (1 - m.discount/100.0)) ASC`;
  } else if (sort === 'price_desc') {
    query += ` ORDER BY (m.price * (1 - m.discount/100.0)) DESC`;
  } else if (sort === 'discount') {
    query += ` ORDER BY m.discount DESC`;
  } else {
    query += ` ORDER BY m.name ASC`;
  }

  const medicines = db.prepare(query).all(...params);

  // Attach nearby pharmacy stock & pricing for each medicine
  const pharmacies = db.prepare('SELECT * FROM pharmacies WHERE is_open = 1').all() as any[];

  const enrichedMedicines = medicines.map((med: any) => {
    const stockEntries = db.prepare(`
      SELECT pm.*, p.name as pharmacy_name, p.estimated_delivery_min, p.lat, p.lng
      FROM pharmacy_medicines pm
      JOIN pharmacies p ON pm.pharmacy_id = p.id
      WHERE pm.medicine_id = ? AND pm.stock > 0
    `).all(med.id);

    return {
      ...med,
      prescription_required: Boolean(med.prescription_required),
      availability: Boolean(med.availability),
      available_pharmacies: stockEntries
    };
  });

  res.json(enrichedMedicines);
});

// GET /api/medicines/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const medicine = db.prepare(`
    SELECT m.*, c.name as category_name, c.slug as category_slug
    FROM medicines m
    LEFT JOIN categories c ON m.category_id = c.id
    WHERE m.id = ?
  `).get(id) as any;

  if (!medicine) {
    return res.status(404).json({ error: 'Medicine not found' });
  }

  const stockEntries = db.prepare(`
    SELECT pm.*, p.name as pharmacy_name, p.rating, p.address, p.estimated_delivery_min, p.lat, p.lng, p.phone
    FROM pharmacy_medicines pm
    JOIN pharmacies p ON pm.pharmacy_id = p.id
    WHERE pm.medicine_id = ?
  `).all(medicine.id);

  res.json({
    ...medicine,
    prescription_required: Boolean(medicine.prescription_required),
    availability: Boolean(medicine.availability),
    pharmacies: stockEntries
  });
});

export default router;
