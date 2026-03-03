const express = require('express');
const {
    getTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    resetTenantPassword,
} = require('./superAdmin.controller');

const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Apply protection and strict super_admin authorization to ALL routes in this file
router.use(protect);
router.use(authorize('super_admin'));

router.route('/tenants')
    .get(getTenants)
    .post(createTenant);

router.route('/tenants/:id')
    .put(updateTenant)
    .delete(deleteTenant);

router.put('/tenants/:id/reset-password', resetTenantPassword);

module.exports = router;
