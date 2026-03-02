const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a tenant name'],
        },
        ownerName: {
            type: String,
            required: [true, 'Please add the owner name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        phone: {
            type: String,
            required: [true, 'Please add a phone number'],
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
            required: true,
        },
        planStatus: {
            type: String,
            enum: ['active', 'expired', 'suspended'],
            default: 'active',
        },
        planStartDate: {
            type: Date,
            default: Date.now,
        },
        planExpiryDate: {
            type: Date,
            required: true,
        },
        employeeLimit: {
            type: Number,
            required: true,
        },
        leadLimit: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'suspended'],
            default: 'active',
        },
        currentLeadCount: {
            type: Number,
            default: 0,
        },
        currentEmployeeCount: {
            type: Number,
            default: 0,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Tenant', tenantSchema);
