import { Router } from 'express';
import db from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30').all(userId) as any[];
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as any;

  res.json({
    notifications: notifications.map(n => ({ ...n, is_read: Boolean(n.is_read) })),
    unreadCount: unreadCount ? unreadCount.count : 0
  });
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, userId);
  res.json({ message: 'Notification marked as read' });
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  res.json({ message: 'All notifications marked as read' });
});

export default router;
