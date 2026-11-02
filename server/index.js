const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');

const db = require('./db');
const seedDatabase = require('./db/seed');
const { authenticateUser } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const categoriesRoutes = require('./routes/categories');
const servicesRoutes = require('./routes/services');
const availabilityRoutes = require('./routes/availability');
const bookingsRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

// Ensure database has initial data
try {
  seedDatabase(false);
} catch (e) {
  console.warn('Auto-seed check note:', e.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(authenticateUser);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'SQLite (local)',
    version: '1.0.0',
  });
});

// Serve frontend build if available
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 NovaReserve Server running on http://localhost:${PORT}`);
  console.log(`📂 SQLite database active at: ./server/data/novareserve.sqlite`);
  console.log(`🔑 Zero-credential mode: Default demo accounts ready`);
  console.log(`======================================================\n`);
});
