const express = require('express');
const {
    scheduleVisit,
    updateVisitStatus,
    getVisits,
} = require('./visit.controller');

const { protect, authorize } = require('../../middlewares/auth.middleware');
const { planGuard } = require('../../middlewares/planGuard.middleware');

const router = express.Router();

router.use(protect, planGuard);

router.route('/')
    .get(getVisits)
    .post(authorize('admin', 'sales'), scheduleVisit);

router.put('/:id/status', authorize('admin', 'field_agent', 'sales'), updateVisitStatus);

module.exports = router;
