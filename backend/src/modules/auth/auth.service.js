const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} Token
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, tenantId: user.tenantId, role: user.role },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '30d',
        }
    );
};

module.exports = {
    generateToken,
};
