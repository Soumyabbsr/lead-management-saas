const express = require('express');
const {
    createBooking,
    getBookings,
} = require('./booking.controller');

const { protect, authorize } = require('../../middlewares/auth.middleware');
const { planGuard } = require('../../middlewares/planGuard.middleware');

const router = express.Router();

router.use(protect, planGuard);

router.route('/')
    .get(authorize('admin', 'sales'), getBookings)
    .post(authorize('admin', 'sales'), createBooking);

module.exports = router;
