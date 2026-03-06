const asyncHandler = require('express-async-handler');
const Tenant = require('../../models/Tenant');
const User = require('../../models/User');
const Plan = require('../../models/Plan');
const mongoose = require('mongoose');

// @desc    Get all active tenants
// @route   GET /api/super-admin/tenants
// @access  Private (Super Admin)
const getTenants = asyncHandler(async (req, res) => {
    // using $ne: true accommodates old records missing the isDeleted field entirely
    const tenants = await Tenant.find({ isDeleted: { $ne: true } }).populate('planId', 'name');
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

    const { email, ownerName, phone, name, status, planId, employeeLimit, leadLimit, planExpiryDate } = req.body;

    // If email is provided, we must check if it's already used by another user
    let normalizedEmail = email ? email.toLowerCase().trim() : tenant.email;

    if (email && normalizedEmail !== tenant.email.toLowerCase().trim()) {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            res.status(400);
            throw new Error('Email is already in use by another account');
        }
    }

    // Toggle suspend status if provided
    if (status) {
        tenant.status = status;
        if (status === 'suspended') {
            tenant.planStatus = 'suspended';
        } else if (status === 'active' && tenant.planStatus === 'suspended') {
            tenant.planStatus = 'active';
        }
    }

    // Update core tenant fields
    tenant.name = name || tenant.name;
    tenant.ownerName = ownerName || tenant.ownerName;
    tenant.email = normalizedEmail;
    tenant.phone = phone || tenant.phone;

    if (planId) tenant.planId = planId;
    if (employeeLimit !== undefined) tenant.employeeLimit = employeeLimit;
    if (leadLimit !== undefined) tenant.leadLimit = leadLimit;
    if (planExpiryDate) tenant.planExpiryDate = planExpiryDate;

    await tenant.save();

    // Synchronize these changes with the Tenant's Admin User account
    const adminUser = await User.findOne({ tenantId: tenant._id, role: 'admin' });
    if (adminUser) {
        if (ownerName) adminUser.name = ownerName;
        if (email) adminUser.email = normalizedEmail;
        if (phone) adminUser.phone = phone;
        // User status can sync with Tenant status roughly, or remain distinct, but useful to disable login
        if (status === 'suspended') {
            adminUser.status = 'Inactive';
        } else if (status === 'active') {
            adminUser.status = 'Active';
        }
        await adminUser.save();
    }

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

// @desc    Reset a tenant owner's password
// @route   PUT /api/super-admin/tenants/:id/reset-password
// @access  Private (Super Admin)
const resetTenantPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password) {
        res.status(400);
        throw new Error('Please provide a new password');
    }

    const tenant = await Tenant.findOne({ _id: req.params.id, isDeleted: { $ne: true } });

    if (!tenant) {
        res.status(404);
        throw new Error('Tenant not found');
    }

    // Find the primary admin user for this tenant
    const adminUser = await User.findOne({ tenantId: tenant._id, role: 'admin' });

    if (!adminUser) {
        res.status(404);
        throw new Error('Primary admin user not found for this tenant');
    }

    // Update password (the pre-save hook in User model will handle hashing)
    adminUser.password = password;
    await adminUser.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successful',
        email: adminUser.email
    });
});

// @desc    Get platform stats (aggregated)
// @route   GET /api/super-admin/stats
// @access  Private (Super Admin)
const getStats = asyncHandler(async (req, res) => {
    const tenants = await Tenant.find({ isDeleted: { $ne: true } }).populate('planId', 'name priceMonthly');
    const plans = await Plan.find();

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    const suspendedTenants = tenants.filter(t => t.status === 'suspended').length;
    const expiringSoon = tenants.filter(t => t.planExpiryDate && new Date(t.planExpiryDate) <= thirtyDaysFromNow && new Date(t.planExpiryDate) >= now).length;

    // Revenue estimate: sum of monthly prices of all active tenants' plans
    let monthlyRevenue = 0;
    tenants.forEach(t => {
        if (t.status === 'active' && t.planId && t.planId.priceMonthly) {
            monthlyRevenue += t.planId.priceMonthly;
        }
    });

    // Plan distribution
    const planDistribution = {};
    tenants.forEach(t => {
        const planName = t.planId?.name || 'Unknown';
        planDistribution[planName] = (planDistribution[planName] || 0) + 1;
    });

    // Recent tenants (last 5)
    const recentTenants = tenants
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(t => ({
            _id: t._id,
            name: t.name,
            ownerName: t.ownerName,
            email: t.email,
            status: t.status,
            planName: t.planId?.name || 'N/A',
            createdAt: t.createdAt,
        }));

    res.status(200).json({
        success: true,
        data: {
            totalTenants,
            activeTenants,
            suspendedTenants,
            totalPlans: plans.length,
            expiringSoon,
            monthlyRevenue,
            planDistribution,
            recentTenants,
        },
    });
});

// @desc    Change super admin's own password
// @route   PUT /api/super-admin/change-password
// @access  Private (Super Admin)
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide both current and new passwords');
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error('New password must be at least 6 characters');
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
});

module.exports = {
    getTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    resetTenantPassword,
    getStats,
    changePassword,
};
