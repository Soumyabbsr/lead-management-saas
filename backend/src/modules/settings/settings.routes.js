const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('./settings.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { planGuard } = require('../../middlewares/planGuard.middleware');

// Anyone logged in can get settings (need areas for dropdowns)
router.route('/').get(protect, getSettings);

// Only admins can update global settings
router.route('/').put(protect, authorize('admin'), updateSettings);

module.exports = router;
