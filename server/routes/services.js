const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/services
router.get('/', (req, res) => {
  const { category, search, activeOnly = 'true' } = req.query;

  let query = `
    SELECT 
      s.*, 
      c.name as category_name, 
      c.slug as category_slug,
      ROUND(AVG(r.rating), 1) as avg_rating,
      COUNT(r.id) as review_count
    FROM services s
    JOIN categories c ON s.category_id = c.id
    LEFT JOIN reviews r ON r.service_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (activeOnly === 'true') {
    query += ` AND s.active = 1`;
  }

  if (category) {
    query += ` AND c.slug = ?`;
    params.push(category);
  }

  if (search) {
    query += ` AND (s.title LIKE ? OR s.description LIKE ? OR s.tag LIKE ?)`;
    const wildcard = `%${search}%`;
    params.push(wildcard, wildcard, wildcard);
  }

  query += ` GROUP BY s.id ORDER BY s.id ASC`;

  const rawServices = db.prepare(query).all(...params);

  const services = rawServices.map((svc) => ({
    ...svc,
    highlights: svc.highlights ? JSON.parse(svc.highlights) : [],
    avg_rating: svc.avg_rating || 5.0,
    review_count: svc.review_count || 0,
  }));

  res.json({ services });
});

// GET /api/services/:id
router.get('/:id', (req, res) => {
  const service = db.prepare(`
    SELECT 
      s.*, 
      c.name as category_name, 
      c.slug as category_slug,
      ROUND(AVG(r.rating), 1) as avg_rating,
      COUNT(r.id) as review_count
    FROM services s
    JOIN categories c ON s.category_id = c.id
    LEFT JOIN reviews r ON r.service_id = s.id
    WHERE s.id = ?
    GROUP BY s.id
  `).get(req.params.id);

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const reviews = db.prepare(`
    SELECT id, author_name, rating, comment, created_at
    FROM reviews
    WHERE service_id = ?
    ORDER BY created_at DESC
  `).all(req.params.id);

  res.json({
    service: {
      ...service,
      highlights: service.highlights ? JSON.parse(service.highlights) : [],
      avg_rating: service.avg_rating || 5.0,
      review_count: service.review_count || 0,
      reviews,
    },
  });
});

// POST /api/services (Admin only)
router.post('/', requireAdmin, (req, res) => {
  const {
    category_id,
    title,
    tag,
    description,
    price,
    duration_min = 60,
    image_url,
    capacity = 1,
    highlights = [],
  } = req.body;

  if (!category_id || !title || !description || price === undefined || !image_url) {
    return res.status(400).json({ error: 'Missing required service fields' });
  }

  const stmt = db.prepare(`
    INSERT INTO services (
      category_id, title, tag, description, price, duration_min, image_url, capacity, active, highlights
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  const result = stmt.run(
    category_id,
    title.trim(),
    tag || null,
    description.trim(),
    parseFloat(price),
    parseInt(duration_min),
    image_url.trim(),
    parseInt(capacity),
    JSON.stringify(highlights || [])
  );

  res.status(201).json({
    message: 'Service created successfully',
    id: result.lastInsertRowid,
  });
});

// PUT /api/services/:id (Admin only)
router.put('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT id FROM services WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const {
    category_id,
    title,
    tag,
    description,
    price,
    duration_min,
    image_url,
    capacity,
    active,
    highlights,
  } = req.body;

  const stmt = db.prepare(`
    UPDATE services SET
      category_id = COALESCE(?, category_id),
      title = COALESCE(?, title),
      tag = COALESCE(?, tag),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      duration_min = COALESCE(?, duration_min),
      image_url = COALESCE(?, image_url),
      capacity = COALESCE(?, capacity),
      active = COALESCE(?, active),
      highlights = COALESCE(?, highlights)
    WHERE id = ?
  `);

  stmt.run(
    category_id || null,
    title ? title.trim() : null,
    tag !== undefined ? tag : null,
    description ? description.trim() : null,
    price !== undefined ? parseFloat(price) : null,
    duration_min !== undefined ? parseInt(duration_min) : null,
    image_url ? image_url.trim() : null,
    capacity !== undefined ? parseInt(capacity) : null,
    active !== undefined ? (active ? 1 : 0) : null,
    highlights !== undefined ? JSON.stringify(highlights) : null,
    id
  );

  res.json({ message: 'Service updated successfully' });
});

// DELETE /api/services/:id (Admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  // Soft delete by setting active = 0 or hard delete if no confirmed bookings
  const bookingsCount = db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE service_id = ? AND status = 'confirmed'
  `).get(id).count;

  if (bookingsCount > 0) {
    db.prepare('UPDATE services SET active = 0 WHERE id = ?').run(id);
    return res.json({ message: 'Service has active bookings, marked as inactive' });
  }

  db.prepare('DELETE FROM services WHERE id = ?').run(id);
  res.json({ message: 'Service deleted successfully' });
});

module.exports = router;
