const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
    {
        // Singleton pattern identifier
        singletonId: {
            type: String,
            default: 'global_settings',
            unique: true,
        },
        operatingAreas: {
            type: [String],
            default: ['Koramangala', 'Indiranagar', 'HSR Layout', 'BTM Layout', 'Whitefield', 'Marathahalli', 'Electronic City', 'Sarjapur', 'Jayanagar'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Settings', settingsSchema);
