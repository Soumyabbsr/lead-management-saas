const express = require('express');
const { loginUser, getMe, updatePassword } = require('./auth.controller');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
