// backend/api/index.js
const app = require('../src/app');
const connectDB = require('../src/config/db');

// Ensure DB is connected for serverless calls
// The connection is cached within db.js, avoiding connection exhaustion.
connectDB();

module.exports = app;
