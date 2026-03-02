const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
        },
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'INR',
        },
        status: {
            type: String,
            enum: ['success', 'failed', 'pending'],
            default: 'pending',
        },
        paymentId: {
            type: String, // from gateway
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Payment', paymentSchema);
