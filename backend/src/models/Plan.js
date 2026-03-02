const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a plan name (Free, Basic, Pro)'],
            enum: ['Free', 'Basic', 'Pro'],
        },
        priceMonthly: {
            type: Number,
            required: true,
            default: 0,
        },
        priceYearly: {
            type: Number,
            required: true,
            default: 0,
        },
        maxEmployees: {
            type: Number,
            required: true,
        },
        maxLeads: {
            type: Number,
            required: true,
        },
        features: {
            type: [String],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Plan', planSchema);
