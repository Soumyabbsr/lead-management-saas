const express = require('express');
const { protect } = require('../../middlewares/auth.middleware');
const { planGuard } = require('../../middlewares/planGuard.middleware');
const { checkIn, checkOut, getTodayAttendance, getAttendanceByDate } = require('./attendance.controller');

const router = express.Router();

router.use(protect, planGuard); // All attendance routes require authentication

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayAttendance);
router.get('/', getAttendanceByDate);

module.exports = router;
