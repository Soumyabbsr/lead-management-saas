const express = require('express');
const { getActivities } = require('./activity.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { planGuard } = require('../../middlewares/planGuard.middleware');

const router = express.Router();

router.use(protect, planGuard);

router.get('/', authorize('admin'), getActivities);

module.exports = router;
