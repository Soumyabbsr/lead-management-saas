const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middlewares/error.middleware');
const User = require('./models/User');   // ✅ ADD THIS LINE

const app = express();

// CORS — allow main domain, Vercel previews, and localhost
const allowedOrigins = [
  'https://lead-management-saas.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow main domain
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Allow all Vercel preview subdomains (*.vercel.app)
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);

    // Allow localhost for development
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);

    // Reject everything else
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (selfies, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));


// Basic route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'PG CRM API is running' });
});

// 🔥 TEMP ADMIN CREATION ROUTE (ADD THIS BLOCK)
app.get('/create-admin', async (req, res) => {
  try {
    await User.create({
      name: "Super Admin",
      email: "admin@pgcrm.com",
      password: "Admin@123",  // plain password (auto hashed)
      role: "super_admin",
      status: "Active"
    });

    res.json({ success: true, message: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Import and mount routes here
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/employees', require('./modules/employees/employee.routes'));
app.use('/api/leads', require('./modules/leads/lead.routes'));
app.use('/api/activities', require('./modules/activities/activity.routes'));
app.use('/api/visits', require('./modules/visits/visit.routes'));
app.use('/api/bookings', require('./modules/bookings/booking.routes'));
app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));
app.use('/api/settings', require('./modules/settings/settings.routes'));
app.use('/api/whatsapp', require('./modules/whatsapp/whatsapp.routes'));
app.use('/api/super-admin/plans', require('./modules/plans/plan.routes'));
app.use('/api/super-admin', require('./modules/super-admin/superAdmin.routes'));
app.use('/api/attendance', require('./modules/attendance/attendance.routes'));

// Global Error Handler
app.use(errorHandler);

module.exports = app;
