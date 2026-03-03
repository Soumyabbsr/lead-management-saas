const asyncHandler = require('express-async-handler');
const User = require('../../models/User');
const { generateToken } = require('./auth.service');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide an email and password');
    }

    // Check for user
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Check if active
    if (user.status === 'Inactive') {
        res.status(401);
        throw new Error('User account is inactive');
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});

// Helper to send standard token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        data: {
            user,
            token,
        },
    });
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        res.status(401);
        throw new Error('Incorrect current password');
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

module.exports = {
    loginUser,
    getMe,
    updatePassword,
};
