const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        res.status(401);
        throw new Error('Not authorized to access this route');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            res.status(401);
            throw new Error('User no longer exists');
        }

        if (req.user.status === 'Inactive') {
            res.status(401);
            throw new Error('User account is inactive');
        }

        next();
    } catch (err) {
        res.status(401);
        throw new Error('Not authorized to access this route');
    }
});

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        const lowerRoles = roles.map(r => r.toLowerCase());
        const userRole = req.user?.role ? req.user.role.toLowerCase() : '';
        if (!lowerRoles.includes(userRole)) {
            res.status(403);
            throw new Error(`User role '${req.user.role}' is not authorized to access this route`);
        }
        next();
    };
};

module.exports = { protect, authorize };
