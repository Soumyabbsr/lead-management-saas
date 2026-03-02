const asyncHandler = require('express-async-handler');
const Activity = require('../../models/Activity');

// @desc    Get global activity timeline
// @route   GET /api/activities
// @access  Private (Admin)
const getActivities = asyncHandler(async (req, res) => {
    let query = Activity.find({ tenantId: req.user.tenantId })
        .populate('performedBy', 'name role')
        .populate('leadId', 'name')
        .sort('-createdAt'); // Latest first

    // If we want Sales agents to see activity for only their own leads,
    // we would need to join Leads or filter by assignment.
    // The system prompt logic specifies "Global Activity Log" usually implies Admin.
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view global activity log');
    }

    const activities = await query;

    res.status(200).json({ success: true, count: activities.length, data: activities });
});

module.exports = {
    getActivities,
};
