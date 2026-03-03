const express = require('express');
const {
    getPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan
} = require('./plan.controller');

const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Apply protection and strict super_admin authorization to ALL routes in this file
router.use(protect);
router.use(authorize('super_admin'));

router.route('/')
    .get(getPlans)
    .post(createPlan);

router.route('/:id')
    .get(getPlan)
    .put(updatePlan)
    .delete(deletePlan);

module.exports = router;
