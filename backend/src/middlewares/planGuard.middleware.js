const asyncHandler = require('express-async-handler');
const Tenant = require('../models/Tenant');

const planGuard = asyncHandler(async (req, res, next) => {
    // protect middleware must run before this to set req.user
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized to access this route');
    }

    // super_admin bypasses plan guard
    if (req.user.role === 'super_admin') {
        return next();
    }

    if (!req.user.tenantId) {
        res.status(401);
        throw new Error('No tenant associated with user');
    }

    const tenant = await Tenant.findById(req.user.tenantId);

    if (!tenant) {
        res.status(401);
        throw new Error('Tenant not found');
    }

    if (tenant.status === 'suspended') {
        res.status(403);
        throw new Error('Tenant account is suspended');
    }

    if (new Date() > new Date(tenant.planExpiryDate)) {
        res.status(403);
        throw new Error('Tenant plan has expired');
    }

    req.tenant = tenant; // Optionally attach tenant object

    next();
});

module.exports = { planGuard };
