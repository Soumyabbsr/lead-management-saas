const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/error.middleware');
const User = require('./models/User');   // ✅ ADD THIS LINE

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/super-admin', require('./modules/super-admin/superAdmin.routes'));
app.use('/api/attendance', require('./modules/attendance/attendance.routes'));

// Global Error Handler
app.use(errorHandler);

module.exports = app;
