const asyncHandler = require('express-async-handler');
const Lead = require('../../models/Lead');
const User = require('../../models/User');
const Activity = require('../../models/Activity');
const Tenant = require('../../models/Tenant');
const { sendTemplate } = require('../whatsapp/whatsapp.service');

const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || 'visit_reminder';
const TEMPLATE_LANGUAGE = process.env.WHATSAPP_TEMPLATE_LANG || 'en';

/**
 * Convert 24h time to 12h format (e.g., "14:30" -> "02:30 PM")
 */
const formatTime12h = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

// Helper function to auto-assign lead based on preferred Area
const assignLead = async (preferredArea, tenantId) => {
    // Find admins as fallback
    const admin = await User.findOne({ role: 'admin', tenantId });

    if (!preferredArea) return admin ? admin._id : null;

    // Find users who have this area assigned
    const eligibleAgents = await User.find({
        role: 'sales',
        status: 'Active',
        assignedAreas: { $in: [preferredArea] },
        tenantId
    });

    if (eligibleAgents.length === 0) {
        return admin ? admin._id : null; // Provide fallback to admin
    }

    // To implement round robin, we could find the one with the least leads, 
    // but for simplicity we will just pick a random one from the eligible agents
    const randomIndex = Math.floor(Math.random() * eligibleAgents.length);
    return eligibleAgents[randomIndex]._id;
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
const getLeads = asyncHandler(async (req, res) => {
    let query;

    // Admin can see all leads, Sales can see only their assigned leads
    const activitiesPopulate = { path: 'activities', populate: { path: 'performedBy', select: 'name' } };

    if (req.user.role === 'admin') {
        query = Lead.find({ tenantId: req.user.tenantId })
            .populate('assignedTo', 'name email')
            .populate(activitiesPopulate)
            .sort('-createdAt');
    } else if (req.user.role === 'sales') {
        query = Lead.find({ assignedTo: req.user._id, tenantId: req.user.tenantId })
            .populate('assignedTo', 'name email')
            .populate(activitiesPopulate)
            .sort('-createdAt');
    } else {
        res.status(403);
        throw new Error('Not authorized to access leads list');
    }

    const leads = await query;
    res.status(200).json({ success: true, count: leads.length, data: leads });
});

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
const getLead = asyncHandler(async (req, res) => {
    const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.user.tenantId })
        .populate('activities')
        .populate('assignedTo', 'name email');

    if (!lead) {
        res.status(404);
        throw new Error('Lead not found');
    }

    // Role check
    if (req.user.role === 'sales' && lead.assignedTo._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this lead');
    }

    res.status(200).json({ success: true, data: lead });
});

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
const createLead = asyncHandler(async (req, res) => {
    // Check limits
    const tenant = await Tenant.findById(req.user.tenantId);
    if (tenant.currentLeadCount >= tenant.leadLimit) {
        res.status(403);
        throw new Error('Lead limit reached for this plan');
    }

    req.body.createdBy = req.user._id;

    // Determine auto-assignment
    req.body.assignedTo = await assignLead(req.body.preferredArea, req.user.tenantId);

    const lead = await Lead.create({ ...req.body, tenantId: req.user.tenantId });

    // Increment log
    tenant.currentLeadCount += 1;
    await tenant.save();

    // Log Activity
    await Activity.create({
        tenantId: req.user.tenantId,
        leadId: lead._id,
        type: 'LEAD_CREATED',
        description: `Lead created and auto-assigned`,
        performedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: lead });
});

// @desc    Update lead (stage, assign, notes)
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = asyncHandler(async (req, res) => {
    let lead = await Lead.findOne({ _id: req.params.id, tenantId: req.user.tenantId });

    if (!lead) {
        res.status(404);
        throw new Error('Lead not found');
    }

    // Role check
    if (req.user.role === 'sales' && lead.assignedTo.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this lead');
    }

    const originalStage = lead.stage;
    const originalAssigned = lead.assignedTo.toString();

    lead = await Lead.findOneAndUpdate({ _id: req.params.id, tenantId: req.user.tenantId }, req.body, {
        new: true,
        runValidators: true,
    });

    // Check what changed and log activities accordingly
    if (req.body.stage && req.body.stage !== originalStage) {
        await Activity.create({
            tenantId: req.user.tenantId,
            leadId: lead._id,
            type: 'STAGE_CHANGED',
            description: `Lead stage moved from ${originalStage} to ${req.body.stage}`,
            performedBy: req.user._id,
        });
    }

    if (req.body.assignedTo && req.body.assignedTo !== originalAssigned) {
        const newAssignee = await User.findById(req.body.assignedTo);
        await Activity.create({
            tenantId: req.user.tenantId,
            leadId: lead._id,
            type: 'LEAD_REASSIGNED',
            description: `Lead reassigned to ${newAssignee ? newAssignee.name : 'Unknown User'}`,
            performedBy: req.user._id,
        });
    }

    if (req.body.followUpDue) {
        await Activity.create({
            tenantId: req.user.tenantId,
            leadId: lead._id,
            type: 'FOLLOWUP_SCHEDULED',
            description: `Follow-up scheduled for ${new Date(req.body.followUpDue).toLocaleString('en-IN')}`,
            performedBy: req.user._id,
        });
    }

    if (req.body.visitDate && req.body.visitStatus === 'Confirmed') {
        await Activity.create({
            tenantId: req.user.tenantId,
            leadId: lead._id,
            type: 'VISIT_SCHEDULED',
            description: `Visit scheduled for ${new Date(req.body.visitDate).toLocaleString('en-IN')}`,
            performedBy: req.user._id,
        });

        // ── Send instant WhatsApp notification ──
        try {
            const recipientPhone = lead.whatsapp || lead.phone;
            console.log(`[Lead Update] Visit scheduled! Phone: ${recipientPhone}, visitDate: ${req.body.visitDate}`);

            if (recipientPhone) {
                // Get visit time from visitSchedule or visitDate
                const visitSchedule = req.body.visitSchedule;
                const visitTimeStr = visitSchedule?.time || '';
                const displayTime = formatTime12h(visitTimeStr) || new Date(req.body.visitDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                // Get assigned agent phone for staff_number
                const agent = await User.findById(lead.assignedTo).select('phone');
                const staffPhone = agent?.phone || '';

                const bodyParameters = [
                    { type: 'text', text: lead.name || 'Customer' },
                    { type: 'text', text: displayTime },
                    { type: 'text', text: lead.preferredArea || 'the property' },
                    { type: 'text', text: staffPhone },
                ];

                console.log(`[Lead Update] Sending WhatsApp template to ${recipientPhone}...`);

                const result = await sendTemplate(
                    recipientPhone,
                    TEMPLATE_NAME,
                    TEMPLATE_LANGUAGE,
                    bodyParameters
                );

                if (result.success) {
                    console.log(`[Lead Update] ✅ WhatsApp sent for lead ${lead._id}`);
                } else {
                    console.log(`[Lead Update] ⚠️ WhatsApp failed: ${result.error}`);
                }
            } else {
                console.log(`[Lead Update] No phone number for lead ${lead._id}`);
            }
        } catch (waErr) {
            console.error('[Lead Update] WhatsApp error:', waErr.message);
        }
    } else if (req.body.visitStatus === 'Done') {
        await Activity.create({
            tenantId: req.user.tenantId,
            leadId: lead._id,
            type: 'VISIT_DONE',
            description: `Visit marked as Done`,
            performedBy: req.user._id,
        });
    }

    if (req.body.bookingDetails) {
        await Activity.create({
            tenantId: req.user.tenantId,
            leadId: lead._id,
            type: 'BOOKING_CREATED',
            description: `Booking confirmed for ₹${req.body.bookingDetails.rentAmount}`,
            performedBy: req.user._id,
        });
    }

    res.status(200).json({ success: true, data: lead });
});

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private/Admin
const deleteLead = asyncHandler(async (req, res) => {
    const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.user.tenantId });

    if (!lead) {
        res.status(404);
        throw new Error('Lead not found');
    }

    await lead.deleteOne();

    const tenant = await Tenant.findById(req.user.tenantId);
    if (tenant && tenant.currentLeadCount > 0) {
        tenant.currentLeadCount -= 1;
        await tenant.save();
    }

    // Log activity
    await Activity.create({
        tenantId: req.user.tenantId,
        leadId: lead._id, // Will be kept as detached history
        type: 'LEAD_DELETED',
        description: `Lead '${lead.name}' was deleted`,
        performedBy: req.user._id,
    });

    res.status(200).json({ success: true, data: {} });
});

// @desc    Add notes to a lead
// @route   POST /api/leads/:id/notes
// @access  Private
const addLeadNote = asyncHandler(async (req, res) => {
    const lead = await Lead.findOne({ _id: req.params.id, tenantId: req.user.tenantId });

    if (!lead) {
        res.status(404);
        throw new Error('Lead not found');
    }

    const { noteText, type } = req.body; // type Could be call or note

    await Activity.create({
        tenantId: req.user.tenantId,
        leadId: lead._id,
        type: 'NOTE_ADDED', // Or CALL if specified
        description: `Note: ${noteText}`,
        performedBy: req.user._id,
    });

    // Update last activity
    lead.lastActivity = Date.now();
    await lead.save();

    res.status(201).json({ success: true, message: 'Note added' });
});

module.exports = {
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    addLeadNote,
};
