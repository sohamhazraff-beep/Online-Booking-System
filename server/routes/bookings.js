const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

function generateBookingRef() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(crypto.randomInt(0, chars.length));
  }
  const checksum = chars.charAt(crypto.randomInt(0, chars.length));
  return `NR-${rand}-${checksum}`;
}

// POST /api/bookings (Create a new booking - Public / Authenticated)
router.post('/', (req, res) => {
  const {
    service_id,
    booking_date,
    start_time,
    end_time,
    customer_name,
    customer_email,
    customer_phone,
    guests_count = 1,
    special_requests = '',
    add_ons = [],
    payment_status = 'paid',
  } = req.body;

  if (!service_id || !booking_date || !start_time || !customer_name || !customer_email) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  // Look up service
  const service = db.prepare('SELECT * FROM services WHERE id = ? AND active = 1').get(service_id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found or inactive' });
  }

  // Compute end_time if not provided
  let calculatedEndTime = end_time;
  if (!calculatedEndTime) {
    const [h, m] = start_time.split(':').map(Number);
    const totalMin = h * 60 + m + (service.duration_min || 60);
    const endH = Math.floor(totalMin / 60);
    const endM = totalMin % 60;
    calculatedEndTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }

  // Concurrency check: Ensure slot has remaining capacity
  const overlapping = db.prepare(`
    SELECT COUNT(*) as count FROM bookings 
    WHERE service_id = ? 
      AND booking_date = ? 
      AND status != 'cancelled'
      AND start_time < ? 
      AND end_time > ?
  `).get(service_id, booking_date, calculatedEndTime, start_time).count;

  if (overlapping >= (service.capacity || 1)) {
    return res.status(409).json({ error: 'This time slot was just taken. Please select another slot.' });
  }

  // Calculate pricing
  let addOnsTotal = 0;
  if (Array.isArray(add_ons)) {
    addOnsTotal = add_ons.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }
  const totalPrice = Number((service.price + addOnsTotal).toFixed(2));

  // Determine user_id if logged in
  const userId = req.user ? req.user.id : null;
  const bookingRef = generateBookingRef();

  const insertStmt = db.prepare(`
    INSERT INTO bookings (
      booking_ref, user_id, service_id, booking_date, start_time, end_time,
      customer_name, customer_email, customer_phone, guests_count,
      special_requests, add_ons, total_price, status, payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
  `);

  const result = insertStmt.run(
    bookingRef,
    userId,
    service.id,
    booking_date,
    start_time,
    calculatedEndTime,
    customer_name.trim(),
    customer_email.trim().toLowerCase(),
    customer_phone ? customer_phone.trim() : null,
    parseInt(guests_count) || 1,
    special_requests ? special_requests.trim() : null,
    JSON.stringify(add_ons || []),
    totalPrice,
    payment_status
  );

  const newBooking = db.prepare(`
    SELECT 
      b.*, 
      s.title as service_title, 
      s.image_url as service_image_url, 
      s.duration_min as service_duration_min,
      c.name as category_name
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN categories c ON s.category_id = c.id
    WHERE b.id = ?
  `).get(result.lastInsertRowid);

  newBooking.add_ons = JSON.parse(newBooking.add_ons || '[]');

  res.status(201).json({
    message: 'Booking confirmed successfully',
    booking: newBooking,
  });
});

// GET /api/bookings (List bookings for Admin or logged-in user)
router.get('/', (req, res) => {
  const { date, status, search, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT 
      b.*, 
      s.title as service_title, 
      s.image_url as service_image_url, 
      s.duration_min as service_duration_min,
      c.name as category_name
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN categories c ON s.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  // If user is not admin, only show their own bookings
  if (!req.user || req.user.role !== 'admin') {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required to list bookings' });
    }
    query += ` AND b.user_id = ?`;
    params.push(req.user.id);
  }

  if (date) {
    query += ` AND b.booking_date = ?`;
    params.push(date);
  }

  if (status && status !== 'all') {
    query += ` AND b.status = ?`;
    params.push(status);
  }

  if (search) {
    query += ` AND (b.booking_ref LIKE ? OR b.customer_name LIKE ? OR b.customer_email LIKE ? OR s.title LIKE ?)`;
    const wildcard = `%${search}%`;
    params.push(wildcard, wildcard, wildcard, wildcard);
  }

  query += ` ORDER BY b.booking_date DESC, b.start_time DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const bookings = db.prepare(query).all(...params).map((b) => ({
    ...b,
    add_ons: b.add_ons ? JSON.parse(b.add_ons) : [],
  }));

  res.json({ bookings });
});

// GET /api/bookings/lookup?ref=NR-XXXXX-X&email=alex@example.com (Public self-service lookup)
router.get('/lookup', (req, res) => {
  const { ref, email } = req.query;

  if (!ref && !email) {
    return res.status(400).json({ error: 'Please provide either a booking reference or customer email' });
  }

  let query = `
    SELECT 
      b.*, 
      s.title as service_title, 
      s.image_url as service_image_url, 
      s.duration_min as service_duration_min,
      c.name as category_name
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN categories c ON s.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (ref) {
    query += ` AND UPPER(b.booking_ref) = UPPER(?)`;
    params.push(ref.trim());
  }

  if (email) {
    query += ` AND LOWER(b.customer_email) = LOWER(?)`;
    params.push(email.trim());
  }

  query += ` ORDER BY b.booking_date DESC, b.start_time DESC`;

  const results = db.prepare(query).all(...params).map((b) => ({
    ...b,
    add_ons: b.add_ons ? JSON.parse(b.add_ons) : [],
  }));

  if (results.length === 0) {
    return res.status(404).json({ error: 'No bookings found matching the provided reference or email' });
  }

  res.json({ bookings: results });
});

// PATCH /api/bookings/:id/status (Update booking status)
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be confirmed, completed, or cancelled' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  // Permission: Admin can update any booking; User can cancel their own booking
  const isAdmin = req.user && req.user.role === 'admin';
  const isOwner = req.user && req.user.id === booking.user_id;

  if (!isAdmin && !isOwner) {
    // If guest cancellation, allow if reference matches header or body (or public cancel)
    const clientRef = req.headers['x-booking-ref'] || req.body.booking_ref;
    if (clientRef !== booking.booking_ref && status !== 'cancelled') {
      return res.status(403).json({ error: 'Unauthorized to modify this booking' });
    }
  }

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id);

  res.json({ message: `Booking marked as ${status}`, status });
});

// POST /api/bookings/:id/reschedule
router.post('/:id/reschedule', (req, res) => {
  const { id } = req.params;
  const { new_date, new_start_time } = req.body;

  if (!new_date || !new_start_time) {
    return res.status(400).json({ error: 'new_date and new_start_time are required' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const service = db.prepare('SELECT duration_min, capacity FROM services WHERE id = ?').get(booking.service_id);

  // Compute new end time
  const [h, m] = new_start_time.split(':').map(Number);
  const totalMin = h * 60 + m + (service.duration_min || 60);
  const new_end_time = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;

  // Check collision (excluding this booking itself)
  const overlapping = db.prepare(`
    SELECT COUNT(*) as count FROM bookings 
    WHERE service_id = ? 
      AND booking_date = ? 
      AND status != 'cancelled'
      AND id != ?
      AND start_time < ? 
      AND end_time > ?
  `).get(booking.service_id, new_date, id, new_end_time, new_start_time).count;

  if (overlapping >= (service.capacity || 1)) {
    return res.status(409).json({ error: 'Requested new time slot is not available' });
  }

  db.prepare(`
    UPDATE bookings 
    SET booking_date = ?, start_time = ?, end_time = ?, status = 'confirmed'
    WHERE id = ?
  `).run(new_date, new_start_time, new_end_time, id);

  res.json({
    message: 'Booking rescheduled successfully',
    booking_date: new_date,
    start_time: new_start_time,
    end_time: new_end_time,
  });
});

// POST /api/bookings/:id/reviews (Leave review for completed/attended service)
router.post('/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { rating, comment, author_name } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating between 1 and 5 is required' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const reviewerName = author_name || (req.user ? req.user.name : booking.customer_name);

  const result = db.prepare(`
    INSERT INTO reviews (service_id, booking_id, author_name, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `).run(booking.service_id, id, reviewerName, parseInt(rating), (comment || '').trim());

  res.status(201).json({
    message: 'Review posted successfully',
    reviewId: result.lastInsertRowid,
  });
});

module.exports = router;
