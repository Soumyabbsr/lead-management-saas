const asyncHandler = require('express-async-handler');
const Settings = require('../../models/Settings');

// @desc    Get tenant settings (or global fallback)
// @route   GET /api/settings
// @access  Private
const getSettings = asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;

    let settings = null;
    if (tenantId) {
        settings = await Settings.findOne({ tenantId });
    }
    if (!settings) {
        settings = await Settings.findOne({ singletonId: 'global_settings' });
    }
    if (!settings) {
        settings = await Settings.create(tenantId ? { tenantId } : { singletonId: 'global_settings' });
    }

    res.status(200).json({ success: true, data: settings });
});

// @desc    Update tenant settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;

    let filter = tenantId ? { tenantId } : { singletonId: 'global_settings' };
    let settings = await Settings.findOne(filter);

    if (!settings) {
        settings = await Settings.create(tenantId ? { tenantId, ...req.body } : { singletonId: 'global_settings', ...req.body });
    } else {
        settings = await Settings.findOneAndUpdate(
            filter,
            req.body,
            { new: true, runValidators: true }
        );
    }

    res.status(200).json({ success: true, data: settings });
});

module.exports = {
    getSettings,
    updateSettings,
};
