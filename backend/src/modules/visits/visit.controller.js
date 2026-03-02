const asyncHandler = require('express-async-handler');
const Visit = require('../../models/Visit');
const Lead = require('../../models/Lead');
const Activity = require('../../models/Activity');

// @desc    Schedule a visit
// @route   POST /api/visits
// @access  Private (Sales/Admin)
const scheduleVisit = asyncHandler(async (req, res) => {
    const { leadId, date, time, fieldAgent } = req.body;

    const lead = await Lead.findOne({ _id: leadId, tenantId: req.user.tenantId });
    if (!lead) {
        res.status(404);
        throw new Error('Lead not found');
    }

    const visit = await Visit.create({
        tenantId: req.user.tenantId,
        leadId,
        date,
        time,
        fieldAgent,
        createdBy: req.user._id,
    });

    // Update lead with visit info and move to 'Visit' stage automatically
    lead.visitDate = date;
    lead.visitStatus = 'Scheduled';
    if (lead.stage === 'New' || lead.stage === 'Contacted') {
        lead.stage = 'Visit';
    }
    await lead.save();

    // Log activity
    await Activity.create({
        tenantId: req.user.tenantId,
        leadId,
        type: 'VISIT_SCHEDULED',
        description: `Visit scheduled for ${date} at ${time} with ${fieldAgent}`,
        performedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: visit });
});

// @desc    Mark visit as done or update status
// @route   PUT /api/visits/:id/status
// @access  Private (Field/Admin/Sales)
const updateVisitStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    const visit = await Visit.findOne({ _id: req.params.id, tenantId: req.user.tenantId });

    if (!visit) {
        res.status(404);
        throw new Error('Visit not found');
    }

    // Authorize check if needed (e.g. Field agent can only update their own)
    if (req.user.role === 'field_agent' && visit.fieldAgent.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this visit');
    }

    visit.status = status;
    await visit.save();

    const lead = await Lead.findOne({ _id: visit.leadId, tenantId: req.user.tenantId });
    if (lead) {
        lead.visitStatus = status;
        await lead.save();

        if (status === 'Done') {
            await Activity.create({
                tenantId: req.user.tenantId,
                leadId: lead._id,
                type: 'VISIT_DONE',
                description: `Visit marked as done. Note: ${note || 'None'}`,
                performedBy: req.user._id,
            });
        }
    }

    res.status(200).json({ success: true, data: visit });
});

// @desc    Get all visits (with filters)
// @route   GET /api/visits
// @access  Private
const getVisits = asyncHandler(async (req, res) => {
    let query = { tenantId: req.user.tenantId };

    if (req.user.role === 'field_agent') {
        query.fieldAgent = req.user._id;
    }

    const visits = await Visit.find(query)
        .populate('leadId', 'name phone preferredArea')
        .populate('fieldAgent', 'name')
        .sort('date');

    res.status(200).json({ success: true, count: visits.length, data: visits });
});

module.exports = {
    scheduleVisit,
    updateVisitStatus,
    getVisits,
};
