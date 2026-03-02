const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
            unique: true, // Typically one active booking per lead
        },
        propertyName: {
            type: String,
            required: [true, 'Please add property name'],
        },
        bedAssigned: {
            type: String,
            required: [true, 'Please add bed assignment'],
        },
        advancePaid: {
            type: Number,
            required: [true, 'Please add advance amount paid'],
        },
        bookingDate: {
            type: Date,
            required: [true, 'Please add the booking date'],
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

module.exports = mongoose.model('Booking', bookingSchema);
