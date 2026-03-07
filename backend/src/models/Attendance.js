const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Late', 'Absent', 'Half-Day'],
        default: 'Present'
    },
    checkIn: {
        type: Date
    },
    checkOut: {
        type: Date
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    selfieUrl: {
        type: String
    },
    locationVerified: {
        type: Boolean,
        default: false
    },
    ipAddress: {
        type: String
    },
    deviceInfo: {
        type: String
    },
    activeLogins: [{
        in: Date,
        out: Date
    }],
    totalDurationMinutes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Compound index to ensure one record per employee per day per tenant
attendanceSchema.index({ employee: 1, date: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
