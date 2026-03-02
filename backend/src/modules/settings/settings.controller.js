const asyncHandler = require('express-async-handler');
const Settings = require('../../models/Settings');

// @desc    Get global settings
// @route   GET /api/settings
// @access  Private
const getSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne({ singletonId: 'global_settings' });

    if (!settings) {
        settings = await Settings.create({});
    }

    res.status(200).json({ success: true, data: settings });
});

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne({ singletonId: 'global_settings' });

    if (!settings) {
        settings = await Settings.create({});
    }

    settings = await Settings.findOneAndUpdate(
        { singletonId: 'global_settings' },
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({ success: true, data: settings });
});

module.exports = {
    getSettings,
    updateSettings,
};
