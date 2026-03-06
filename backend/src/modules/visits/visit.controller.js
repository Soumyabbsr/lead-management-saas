const asyncHandler = require('express-async-handler');
const Visit = require('../../models/Visit');
const Lead = require('../../models/Lead');
const Activity = require('../../models/Activity');
const User = require('../../models/User');
const { sendTemplate } = require('../whatsapp/whatsapp.service');

const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || 'visit_reminder';
const TEMPLATE_LANGUAGE = process.env.WHATSAPP_TEMPLATE_LANG || 'en';

/**
 * Convert 24h time to 12h format (e.g., "14:30" → "02:30 PM")
 */
const formatTime12h = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

/**
 * Combine visit date + time into a proper Date object
 * Handles timezone by using UTC methods
 */
const getVisitDateTime = (visitDate, visitTime) => {
    const date = new Date(visitDate);
    if (visitTime) {
        const [hours, minutes] = visitTime.split(':').map(Number);
        // Set time in IST (UTC+5:30) — subtract offset to get UTC equivalent
        date.setUTCHours(hours - 5, minutes - 30, 0, 0);
    }
    return date;
};

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

    // ── Instant WhatsApp notification if visit is within 2 hours ──
    try {
        const visitDateTime = getVisitDateTime(date, time);
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        if (visitDateTime <= twoHoursFromNow && visitDateTime > now) {
            const recipientPhone = lead.whatsapp || lead.phone;
            if (recipientPhone) {
                // Get field agent's phone for staff_number
                const agent = await User.findById(fieldAgent).select('phone');
                const staffPhone = agent?.phone || '';

                const bodyParameters = [
                    { type: 'text', text: lead.name || 'Customer' },
                    { type: 'text', text: formatTime12h(time) },
                    { type: 'text', text: lead.preferredArea || 'the property' },
                    { type: 'text', text: staffPhone },
                ];

                console.log(`[Visit] Sending instant WhatsApp to ${recipientPhone} (visit within 2hrs)`);

                const result = await sendTemplate(
                    recipientPhone,
                    TEMPLATE_NAME,
                    TEMPLATE_LANGUAGE,
                    bodyParameters
                );

                // Mark as sent
                visit.reminderSentAt = new Date();
                await visit.save();

                if (result.success) {
                    console.log(`[Visit] ✅ Instant reminder sent for visit ${visit._id}`);
                } else {
                    console.log(`[Visit] ⚠️ Instant reminder failed: ${result.error}`);
                }
            }
        }
    } catch (whatsappErr) {
        // Don't fail the visit creation if WhatsApp fails
        console.error('[Visit] WhatsApp notification error:', whatsappErr.message);
    }

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

