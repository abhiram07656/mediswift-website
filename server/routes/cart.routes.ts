import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/cart
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const items = db.prepare(`
    SELECT ci.id, ci.quantity, ci.medicine_id, ci.pharmacy_id,
           m.name as medicine_name, m.generic_name, m.brand, m.strength, m.price, m.discount, m.image, m.prescription_required,
           p.name as pharmacy_name, p.estimated_delivery_min
    FROM cart_items ci
    JOIN medicines m ON ci.medicine_id = m.id
    JOIN pharmacies p ON ci.pharmacy_id = p.id
    WHERE ci.user_id = ?
  `).all(userId) as any[];

  const formattedItems = items.map(item => {
    const discountedPrice = item.price * (1 - item.discount / 100.0);
    return {
      ...item,
      discounted_price: Math.round(discountedPrice * 100) / 100,
      item_total: Math.round(discountedPrice * item.quantity * 100) / 100,
      prescription_required: Boolean(item.prescription_required)
    };
  });

  const subtotal = formattedItems.reduce((acc, curr) => acc + curr.item_total, 0);
  const delivery_fee = subtotal > 0 ? 29 : 0;
  const total = subtotal + delivery_fee;

  res.json({
    items: formattedItems,
    summary: {
      subtotal: Math.round(subtotal * 100) / 100,
      delivery_fee,
      total: Math.round(total * 100) / 100,
      item_count: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0)
    }
  });
});

// POST /api/cart/add
router.post('/add', authenticateToken, (req: AuthRequest, res) => {
  const { medicine_id, pharmacy_id, quantity = 1 } = req.body;
  const userId = req.user?.id;

  if (!medicine_id || !pharmacy_id) {
    return res.status(400).json({ error: 'medicine_id and pharmacy_id are required' });
  }

  const existing = db.prepare(`
    SELECT id, quantity FROM cart_items
    WHERE user_id = ? AND medicine_id = ? AND pharmacy_id = ?
  `).get(userId, medicine_id, pharmacy_id) as any;

  if (existing) {
    const newQty = existing.quantity + quantity;
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
  } else {
    const id = 'cart-' + uuidv4().slice(0, 8);
    db.prepare(`
      INSERT INTO cart_items (id, user_id, medicine_id, pharmacy_id, quantity)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, medicine_id, pharmacy_id, quantity);
  }

  res.json({ message: 'Item added to cart successfully' });
});

// PUT /api/cart/update
router.put('/update', authenticateToken, (req: AuthRequest, res) => {
  const { cart_item_id, quantity } = req.body;
  const userId = req.user?.id;

  if (!cart_item_id || quantity === undefined) {
    return res.status(400).json({ error: 'cart_item_id and quantity are required' });
  }

  if (quantity <= 0) {
    db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(cart_item_id, userId);
  } else {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?').run(quantity, cart_item_id, userId);
  }

  res.json({ message: 'Cart updated successfully' });
});

// DELETE /api/cart/remove
router.delete('/remove/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(id, userId);
  res.json({ message: 'Item removed from cart' });
});

// DELETE /api/cart/clear
router.delete('/clear', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
  res.json({ message: 'Cart cleared' });
});

export default router;
