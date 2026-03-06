const cron = require('node-cron');
const Visit = require('../models/Visit');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { sendTemplate } = require('../modules/whatsapp/whatsapp.service');

// Template config — change these to match your approved Meta template
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || 'visit_reminder';
const TEMPLATE_LANGUAGE = process.env.WHATSAPP_TEMPLATE_LANG || 'en';

/**
 * Combines visit date + time ("HH:MM") into a single Date object
 * Visit times are in IST (UTC+5:30), so we convert to UTC for comparison
 */
const getVisitDateTime = (visitDate, visitTime) => {
    const date = new Date(visitDate);
    if (visitTime) {
        const [hours, minutes] = visitTime.split(':').map(Number);
        // Convert IST to UTC: subtract 5 hours 30 minutes
        date.setUTCHours(hours - 5, minutes - 30, 0, 0);
    }
    return date;
};

/**
 * Format date for display (e.g., "07 Mar 2026")
 */
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

/**
 * Convert 24h time to 12h format (e.g., "14:30" → "02:30 PM")
 */
const formatTime = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

/**
 * Main cron job: find visits due within 2 hours and send WhatsApp reminders
 */
const checkAndSendReminders = async () => {
    try {
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        // Find all scheduled visits that haven't been notified yet
        const visits = await Visit.find({
            status: 'Scheduled',
            reminderSentAt: null,
        }).populate('leadId', 'name phone whatsapp preferredArea')
            .populate('fieldAgent', 'name phone');

        if (visits.length === 0) return;

        let sentCount = 0;

        for (const visit of visits) {
            const visitDateTime = getVisitDateTime(visit.date, visit.time);

            // Only send if visit is within the next 2 hours (and not in the past)
            if (visitDateTime <= twoHoursFromNow && visitDateTime > now) {
                const lead = visit.leadId;
                if (!lead) continue;

                const recipientPhone = lead.whatsapp || lead.phone;
                if (!recipientPhone) {
                    console.log(`[Cron] Skipping visit ${visit._id} — lead has no phone/whatsapp`);
                    continue;
                }

                // Build template parameters matching the approved template:
                // {{name}}, {{time}}, {{property_name}}, {{staff_number}}
                const leadName = lead.name || 'Customer';
                const timeStr = formatTime(visit.time);
                const propertyName = lead.preferredArea || 'the property';
                const staffPhone = visit.fieldAgent?.phone || '';

                const bodyParameters = [
                    { type: 'text', text: leadName },
                    { type: 'text', text: timeStr },
                    { type: 'text', text: propertyName },
                    { type: 'text', text: staffPhone },
                ];

                console.log(`[Cron] Sending visit reminder to ${recipientPhone} for visit ${visit._id}`);

                const result = await sendTemplate(
                    recipientPhone,
                    TEMPLATE_NAME,
                    TEMPLATE_LANGUAGE,
                    bodyParameters
                );

                // Mark as sent regardless of success (to avoid spam retries)
                visit.reminderSentAt = new Date();
                await visit.save();

                if (result.success) {
                    sentCount++;
                    console.log(`[Cron] ✅ Reminder sent for visit ${visit._id}`);
                } else {
                    console.log(`[Cron] ⚠️ Reminder failed for visit ${visit._id}: ${result.error}`);
                }
            }
        }

        if (sentCount > 0) {
            console.log(`[Cron] Visit reminders sent: ${sentCount}`);
        }
    } catch (error) {
        console.error('[Cron] Error in visit reminder job:', error.message);
    }
};

/**
 * Start the cron job — runs every 10 minutes
 */
const startVisitReminderCron = () => {
    console.log('[Cron] Visit reminder cron job started (every 10 minutes)');

    // Run every 10 minutes
    cron.schedule('*/10 * * * *', () => {
        console.log(`[Cron] Checking for upcoming visits... ${new Date().toLocaleString('en-IN')}`);
        checkAndSendReminders();
    });

    // Also run once on startup (after 10 second delay to let DB connect)
    setTimeout(() => {
        console.log('[Cron] Initial visit reminder check...');
        checkAndSendReminders();
    }, 10000);
};

module.exports = { startVisitReminderCron };
