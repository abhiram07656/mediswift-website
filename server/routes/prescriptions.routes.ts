import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// POST /api/prescriptions/upload
router.post('/upload', authenticateToken, upload.single('prescription'), (req: AuthRequest, res) => {
  const file = req.file;
  const { notes } = req.body;
  const userId = req.user?.id;

  if (!file) {
    return res.status(400).json({ error: 'Prescription file is required (JPG, PNG, or PDF)' });
  }

  const id = 'presc-' + uuidv4().slice(0, 8);
  const file_path = `/uploads/${file.filename}`;
  const file_name = file.originalname;
  const file_type = file.mimetype;

  db.prepare(`
    INSERT INTO prescriptions (id, user_id, file_path, file_name, file_type, notes, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'Pending Review', CURRENT_TIMESTAMP)
  `).run(id, userId, file_path, file_name, file_type, notes || '');

  // Send a notification to user
  db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type)
    VALUES (?, ?, ?, ?, 'prescription')
  `).run(
    uuidv4(),
    userId,
    'Prescription Uploaded 📄',
    `Your prescription "${file_name}" has been uploaded and sent to pharmacist for review.`
  );

  const prescription = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);
  res.status(201).json({
    message: 'Prescription uploaded successfully',
    prescription
  });
});

// GET /api/prescriptions/my-prescriptions
router.get('/my-prescriptions', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const prescriptions = db.prepare('SELECT * FROM prescriptions WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  res.json(prescriptions);
});

// GET /api/prescriptions/:id
router.get('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const prescription = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id) as any;

  if (!prescription) {
    return res.status(404).json({ error: 'Prescription not found' });
  }

  // Ensure user owns this prescription or is admin
  if (prescription.user_id !== req.user?.id && req.user?.role !== 'admin' && req.user?.role !== 'pharmacist') {
    return res.status(403).json({ error: 'Unauthorized access to prescription' });
  }

  res.json(prescription);
});

export default router;
