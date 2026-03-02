const express = require('express');
const { getAdminDashboard, getSalesDashboard } = require('./dashboard.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { planGuard } = require('../../middlewares/planGuard.middleware');

const router = express.Router();

router.use(protect, planGuard);

router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/sales', authorize('sales'), getSalesDashboard);

module.exports = router;
