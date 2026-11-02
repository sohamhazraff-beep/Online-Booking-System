const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/categories
router.get('/', (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, COUNT(s.id) as service_count
    FROM categories c
    LEFT JOIN services s ON s.category_id = c.id AND s.active = 1
    GROUP BY c.id
    ORDER BY c.display_order ASC, c.name ASC
  `).all();

  res.json({ categories });
});

module.exports = router;
