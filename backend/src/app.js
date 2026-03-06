const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Security and Optimization Middlewares
app.use(helmet()); // Secure HTTP headers
app.use(compression()); // Compress responses for speed
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL || '*' : '*' })); // Allow frontend origin
app.use(mongoSanitize()); // Prevent NoSQL Injection

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

// Strict auth rate limiter — 5 attempts per 15 minutes on login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'PG CRM API is running' });
});

// Routes
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
