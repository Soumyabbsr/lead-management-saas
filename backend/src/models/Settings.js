const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tenant',
            unique: true,
            sparse: true,
        },
        // Legacy singleton support — kept for backward compat
        singletonId: {
            type: String,
            unique: true,
            sparse: true,
        },
        operatingAreas: {
            type: [String],
            default: [],
        },
        officeLocation: {
            latitude: { type: Number, default: 0 },
            longitude: { type: Number, default: 0 },
            radiusMeters: { type: Number, default: 100 },
        },
        lateThresholdTime: {
            type: String,
            default: '10:00', // HH:mm — check-ins after this are "Late"
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Settings', settingsSchema);
