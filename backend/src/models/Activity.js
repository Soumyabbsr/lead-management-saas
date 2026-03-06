const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        leadId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Lead',
            required: false, // Could be system level activity
        },
        type: {
            type: String,
            enum: [
                'LEAD_CREATED',
                'STAGE_CHANGED',
                'NOTE_ADDED',
                'FOLLOWUP_SCHEDULED',
                'VISIT_SCHEDULED',
                'VISIT_DONE',
                'BOOKING_CREATED',
                'LEAD_REASSIGNED',
                'LEAD_DELETED',
                'EMPLOYEE_CREATED',
                'EMPLOYEE_UPDATED',
                'EMPLOYEE_DEACTIVATED',
            ],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        performedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Activity', activitySchema);
