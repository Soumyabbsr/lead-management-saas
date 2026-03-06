require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

    // Start cron jobs
    try {
        const { startVisitReminderCron } = require('./cron/visitReminder.cron');
        console.log('[Server] Cron module loaded successfully');
        startVisitReminderCron();
    } catch (err) {
        console.error('[Server] ❌ Failed to start cron jobs:', err.message);
        console.error(err.stack);
    }
});
