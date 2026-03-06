const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Please add a name for the lead'],
        },
        phone: {
            type: String,
            required: [true, 'Please add a phone number'],
        },
        whatsapp: {
            type: String,
        },
        preferredArea: {
            type: String,
            default: null,
        },
        budget: {
            type: Number,
            default: null,
        },
        propertyType: {
            type: String,
            enum: ['PG', 'Flat', 'Coliving', 'Not Decided'],
            default: 'Not Decided',
        },
        genderRequirement: {
            type: String,
            enum: ['Boys', 'Girls', 'Any'],
            default: 'Any',
        },
        stage: {
            type: String,
            enum: ['New', 'Contacted', 'Visit', 'Negotiation', 'Booked', 'Lost'],
            default: 'New',
        },
        source: {
            type: String,
            enum: ['Walk-in', 'Reference', 'Facebook', 'Instagram', 'Portal', 'Cold Call', 'Other'],
            default: 'Walk-in',
        },
        assignedTo: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
        followUpDue: {
            type: Date,
            default: null,
        },
        visitDate: {
            type: Date,
            default: null,
        },
        visitStatus: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Done', 'Rescheduled', 'Lost'],
            default: 'Pending',
        },
        followUp: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        visitSchedule: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        bookingDetails: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

leadSchema.index({ tenantId: 1, stage: 1 });
leadSchema.index({ tenantId: 1, assignedTo: 1 }); // Frequent lookup on employee dash
leadSchema.index({ tenantId: 1, followUpDue: 1 }); // Fast overdue lead counts
leadSchema.index({ tenantId: 1, visitDate: 1 });   // Fast visits-today counts

// Virtual for getting activities associated with this lead
leadSchema.virtual('activities', {
    ref: 'Activity',
    localField: '_id',
    foreignField: 'leadId',
    justOne: false,
});

module.exports = mongoose.model('Lead', leadSchema);
