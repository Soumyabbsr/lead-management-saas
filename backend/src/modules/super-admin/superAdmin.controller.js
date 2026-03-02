const asyncHandler = require('express-async-handler');
const Tenant = require('../../models/Tenant');
const User = require('../../models/User');
const Plan = require('../../models/Plan');
const mongoose = require('mongoose');

// @desc    Get all active tenants
// @route   GET /api/super-admin/tenants
// @access  Private (Super Admin)
const getTenants = asyncHandler(async (req, res) => {
    const tenants = await Tenant.find({ isDeleted: false }).populate('planId', 'name');
    res.status(200).json({ success: true, count: tenants.length, data: tenants });
});

// @desc    Create a new tenant
// @route   POST /api/super-admin/tenants
// @access  Private (Super Admin)
const createTenant = asyncHandler(async (req, res) => {
    let { planId } = req.body;

    if (!planId) {
        // Find or create a default 'Free' plan or similar fallback
        let defaultPlan = await Plan.findOne({ name: 'Free' });
        if (!defaultPlan) {
            defaultPlan = await Plan.create({
                name: 'Free',
                priceMonthly: 0,
                priceYearly: 0,
                maxEmployees: req.body.employeeLimit || 5,
                maxLeads: req.body.leadLimit || 100,
            });
        }
        req.body.planId = defaultPlan._id;
    }

    // 1. Create the tenant
    const tenant = await Tenant.create(req.body);

    // 2. Read the password from the input, or fallback to default if not provided
    const providedPassword = req.body.password || 'Welcome@123';

    // 3. Create the initial admin user for this tenant
    const user = await User.create({
        tenantId: tenant._id,
        name: req.body.ownerName || req.body.name,
        email: req.body.email,
        phone: req.body.phone || '0000000000',
        password: providedPassword,
        role: 'admin',
        status: 'Active',
    });

    res.status(201).json({
        success: true,
        data: tenant,
        credentials: {
            email: user.email,
            password: providedPassword
        }
    });
});

// @desc    Update a tenant details
// @route   PUT /api/super-admin/tenants/:id
// @access  Private (Super Admin)
const updateTenant = asyncHandler(async (req, res) => {
    let tenant = await Tenant.findOne({ _id: req.params.id, isDeleted: false });

    if (!tenant) {
        res.status(404);
        throw new Error('Tenant not found');
    }

    // Toggle suspend status if provided
    if (req.body.status) {
        tenant.status = req.body.status;
    }

    // Update other fields
    tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, data: tenant });
});

// @desc    Soft delete a tenant
// @route   DELETE /api/super-admin/tenants/:id
// @access  Private (Super Admin)
const deleteTenant = asyncHandler(async (req, res) => {
    const tenant = await Tenant.findOne({ _id: req.params.id, isDeleted: false });

    if (!tenant) {
        res.status(404);
        throw new Error('Tenant not found');
    }

    tenant.isDeleted = true;
    await tenant.save();

    res.status(200).json({ success: true, message: 'Tenant soft deleted' });
});

module.exports = {
    getTenants,
    createTenant,
    updateTenant,
    deleteTenant,
};
