const express = require('express');
const router = express.Router();
const db = require('../db');

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutesTotal) {
  const hours = Math.floor(minutesTotal / 60);
  const minutes = minutesTotal % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// GET /api/availability?serviceId=1&date=YYYY-MM-DD
router.get('/', (req, res) => {
  const { serviceId, date } = req.query;

  if (!serviceId || !date) {
    return res.status(400).json({ error: 'serviceId and date (YYYY-MM-DD) are required' });
  }

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
  }

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  // Determine day of the week (0 = Sunday, 1 = Monday, ...)
  // Note: create Date using UTC to avoid timezone drift on date strings
  const [year, month, day] = date.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = targetDate.getUTCDay();

  // Find availability rule for this day and service (or fallback global rule)
  let rule = db.prepare(`
    SELECT * FROM availability_rules 
    WHERE (service_id = ? OR service_id IS NULL) AND day_of_week = ?
    ORDER BY service_id DESC
    LIMIT 1
  `).get(serviceId, dayOfWeek);

  if (!rule) {
    rule = {
      start_time: '09:00',
      end_time: '19:00',
      slot_interval_min: service.duration_min || 60,
    };
  }

  const stepMinutes = service.duration_min || rule.slot_interval_min || 60;
  const startMin = parseTime(rule.start_time);
  const endMin = parseTime(rule.end_time);

  // Fetch confirmed bookings for this service on this date
  const existingBookings = db.prepare(`
    SELECT start_time, end_time, guests_count 
    FROM bookings 
    WHERE service_id = ? AND booking_date = ? AND status != 'cancelled'
  `).all(serviceId, date);

  // Check if target date is today or past
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const isToday = (date === todayStr);
  const isPastDate = (date < todayStr);
  const currentMinutesToday = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  const capacity = service.capacity || 1;

  for (let slotStart = startMin; slotStart + stepMinutes <= endMin; slotStart += stepMinutes) {
    const slotEnd = slotStart + stepMinutes;
    const startTimeStr = formatTime(slotStart);
    const endTimeStr = formatTime(slotEnd);

    // Count how many bookings overlap with this slot
    const overlappingBookings = existingBookings.filter((b) => {
      const bStart = parseTime(b.start_time);
      const bEnd = parseTime(b.end_time);
      return bStart < slotEnd && bEnd > slotStart;
    });

    const bookedCount = overlappingBookings.length;
    let isPast = false;

    if (isPastDate) {
      isPast = true;
    } else if (isToday && slotStart <= currentMinutesToday) {
      isPast = true;
    }

    const isAvailable = !isPast && (bookedCount < capacity);

    slots.push({
      startTime: startTimeStr,
      endTime: endTimeStr,
      available: isAvailable,
      capacity,
      bookedCount,
      remainingCapacity: Math.max(0, capacity - bookedCount),
      isPast,
    });
  }

  res.json({
    date,
    serviceId: Number(serviceId),
    serviceTitle: service.title,
    durationMin: service.duration_min,
    capacity: service.capacity,
    totalSlots: slots.length,
    availableSlotsCount: slots.filter((s) => s.available).length,
    slots,
  });
});

module.exports = router;
