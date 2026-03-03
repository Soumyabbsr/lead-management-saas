const asyncHandler = require('express-async-handler');
const Plan = require('../../models/Plan');

// @desc    Get all active plans
// @route   GET /api/super-admin/plans
// @access  Private (Super Admin)
const getPlans = asyncHandler(async (req, res) => {
    const plans = await Plan.find().sort('-createdAt');
    res.status(200).json({ success: true, count: plans.length, data: plans });
});

// @desc    Get single plan
// @route   GET /api/super-admin/plans/:id
// @access  Private (Super Admin)
const getPlan = asyncHandler(async (req, res) => {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }
    res.status(200).json({ success: true, data: plan });
});

// @desc    Create a new plan
// @route   POST /api/super-admin/plans
// @access  Private (Super Admin)
const createPlan = asyncHandler(async (req, res) => {
    const plan = await Plan.create(req.body);
    res.status(201).json({ success: true, data: plan });
});

// @desc    Update a plan
// @route   PUT /api/super-admin/plans/:id
// @access  Private (Super Admin)
const updatePlan = asyncHandler(async (req, res) => {
    let plan = await Plan.findById(req.params.id);

    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }

    plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, data: plan });
});

// @desc    Soft delete or permanently delete a plan
// @route   DELETE /api/super-admin/plans/:id
// @access  Private (Super Admin)
const deletePlan = asyncHandler(async (req, res) => {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }

    await plan.deleteOne();

    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
});

module.exports = {
    getPlans,
    getPlan,
    createPlan,
    updatePlan,
    deletePlan
};
