const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
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
            required: true,
        },
        date: {
            type: Date,
            required: [true, 'Please add a visit date'],
        },
        time: {
            type: String, // HH:MM format
            required: [true, 'Please add a visit time'],
        },
        fieldAgent: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['Scheduled', 'Done', 'Cancelled'],
            default: 'Scheduled',
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Visit', visitSchema);
