import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Haversine formula for distance calculation in kilometers
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Rounded to 1 decimal place
}

// GET /api/pharmacies
router.get('/', (req, res) => {
  const { lat, lng, search } = req.query;

  let query = 'SELECT * FROM pharmacies WHERE 1=1';
  const params: any[] = [];

  if (search) {
    query += ' AND (name LIKE ? OR address LIKE ? OR area LIKE ? OR city LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  const pharmacies = db.prepare(query).all(...params) as any[];

  const userLat = lat ? parseFloat(lat as string) : 12.9352;
  const userLng = lng ? parseFloat(lng as string) : 77.6245;

  const result = pharmacies.map(ph => {
    const distanceKm = calculateHaversineDistance(userLat, userLng, ph.lat, ph.lng);
    return {
      ...ph,
      is_open: Boolean(ph.is_open),
      distance_km: distanceKm
    };
  });

  // Sort by nearest distance
  result.sort((a, b) => a.distance_km - b.distance_km);

  res.json(result);
});

// GET /api/pharmacies/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const pharmacy = db.prepare('SELECT * FROM pharmacies WHERE id = ?').get(id) as any;
  if (!pharmacy) {
    return res.status(404).json({ error: 'Pharmacy not found' });
  }

  const inventory = db.prepare(`
    SELECT pm.stock, pm.price_override, m.*
    FROM pharmacy_medicines pm
    JOIN medicines m ON pm.medicine_id = m.id
    WHERE pm.pharmacy_id = ?
  `).all(id);

  res.json({
    ...pharmacy,
    is_open: Boolean(pharmacy.is_open),
    inventory
  });
});

export default router;
