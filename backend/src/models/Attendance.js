const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Half-Day'],
        default: 'Present'
    },
    checkIn: {
        type: Date
    },
    checkOut: {
        type: Date
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

// Compound index to ensure one record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
