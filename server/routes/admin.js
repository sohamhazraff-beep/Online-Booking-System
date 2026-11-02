const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/admin/stats (Admin analytics dashboard)
router.get('/stats', requireAdmin, (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Overall totals
  const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
  const confirmedBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'").get().count;
  const completedBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'").get().count;
  const cancelledBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'cancelled'").get().count;

  const totalRevenue = db.prepare(`
    SELECT ROUND(SUM(total_price), 2) as sum FROM bookings WHERE status != 'cancelled'
  `).get().sum || 0;

  const bookingsToday = db.prepare(`
    SELECT COUNT(*) as count FROM bookings WHERE booking_date = ? AND status != 'cancelled'
  `).get(today).count;

  const totalServices = db.prepare('SELECT COUNT(*) as count FROM services WHERE active = 1').get().count;
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

  // 2. Bookings by Category
  const categoryBreakdown = db.prepare(`
    SELECT c.name as category_name, COUNT(b.id) as booking_count, ROUND(SUM(b.total_price), 2) as revenue
    FROM categories c
    JOIN services s ON s.category_id = c.id
    LEFT JOIN bookings b ON b.service_id = s.id AND b.status != 'cancelled'
    GROUP BY c.id
    ORDER BY booking_count DESC
  `).all();

  // 3. Top booked services
  const topServices = db.prepare(`
    SELECT s.id, s.title, s.price, s.image_url, COUNT(b.id) as booking_count
    FROM services s
    LEFT JOIN bookings b ON b.service_id = s.id AND b.status != 'cancelled'
    GROUP BY s.id
    ORDER BY booking_count DESC
    LIMIT 5
  `).all();

  // 4. Recent Bookings feed
  const recentBookings = db.prepare(`
    SELECT 
      b.*, 
      s.title as service_title, 
      s.duration_min as service_duration_min,
      c.name as category_name
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN categories c ON s.category_id = c.id
    ORDER BY b.created_at DESC
    LIMIT 6
  `).all().map((b) => ({
    ...b,
    add_ons: b.add_ons ? JSON.parse(b.add_ons) : [],
  }));

  res.json({
    metrics: {
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      bookingsToday,
      totalServices,
      totalUsers,
    },
    categoryBreakdown,
    topServices,
    recentBookings,
  });
});

module.exports = router;
