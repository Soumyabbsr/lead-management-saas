const cron = require('node-cron');
const Visit = require('../models/Visit');
const { sendTemplate } = require('../modules/whatsapp/whatsapp.service');

const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || 'visit_reminder';
const TEMPLATE_LANGUAGE = process.env.WHATSAPP_TEMPLATE_LANG || 'en';

/**
 * Convert 24h time to 12h format (e.g., "14:30" -> "02:30 PM")
 */
const formatTime = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

/**
 * Combine visit date + time into a UTC Date for comparison.
 * Visit times are entered in IST (UTC+5:30), server runs in UTC (Render).
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
 * Find visits due within 2 hours and send WhatsApp reminders
 */
const checkAndSendReminders = async () => {
    try {
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        const visits = await Visit.find({
            status: 'Scheduled',
            reminderSentAt: null,
        })
            .populate('leadId', 'name phone whatsapp preferredArea')
            .populate('fieldAgent', 'name phone');

        if (!visits || visits.length === 0) {
            console.log('[Cron] No pending visit reminders found.');
            return;
        }

        let sentCount = 0;

        for (const visit of visits) {
            const visitDateTime = getVisitDateTime(visit.date, visit.time);

            // Only send if visit is within the next 2 hours and not in the past
            if (visitDateTime <= twoHoursFromNow && visitDateTime > now) {
                const lead = visit.leadId;
                if (!lead) continue;

                const recipientPhone = lead.whatsapp || lead.phone;
                if (!recipientPhone) {
                    console.log(`[Cron] Skipping visit ${visit._id} - no phone number`);
                    continue;
                }

                // Template params: {{name}}, {{time}}, {{property_name}}, {{staff_number}}
                const bodyParameters = [
                    { type: 'text', text: lead.name || 'Customer' },
                    { type: 'text', text: formatTime(visit.time) },
                    { type: 'text', text: lead.preferredArea || 'the property' },
                    { type: 'text', text: visit.fieldAgent?.phone || '' },
                ];

                console.log(`[Cron] Sending reminder to ${recipientPhone} for visit ${visit._id}`);

                const result = await sendTemplate(
                    recipientPhone,
                    TEMPLATE_NAME,
                    TEMPLATE_LANGUAGE,
                    bodyParameters
                );

                visit.reminderSentAt = new Date();
                await visit.save();

                if (result.success) {
                    sentCount++;
                    console.log(`[Cron] Reminder sent for visit ${visit._id}`);
                } else {
                    console.log(`[Cron] Reminder failed for visit ${visit._id}: ${result.error}`);
                }
            }
        }

        console.log(`[Cron] Done. Reminders sent: ${sentCount}`);
    } catch (error) {
        console.error('[Cron] Error:', error.message);
    }
};

/**
 * Start the cron job - runs every 10 minutes
 */
const startVisitReminderCron = () => {
    console.log('[Cron] Visit reminder cron job started (runs every 10 minutes)');

    cron.schedule('*/10 * * * *', () => {
        console.log(`[Cron] Checking for upcoming visits at ${new Date().toISOString()}`);
        checkAndSendReminders();
    });

    // Run once on startup after 10s delay
    setTimeout(() => {
        console.log('[Cron] Initial startup check...');
        checkAndSendReminders();
    }, 10000);
};

module.exports = { startVisitReminderCron };
