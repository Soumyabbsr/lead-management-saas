const express = require('express');
const asyncHandler = require('express-async-handler');
const { sendMessage, sendTemplate } = require('./whatsapp.service');
const { protect } = require('../../middlewares/auth.middleware');
const { planGuard } = require('../../middlewares/planGuard.middleware');

const router = express.Router();

// @desc    Send arbitrary custom message
// @route   POST /api/whatsapp/send
router.post('/send', protect, asyncHandler(async (req, res) => {
    const { to, message } = req.body;
    const result = await sendMessage(to, message);
    res.status(200).json(result);
}));

// @desc    Webhook for receiving incoming messages
// @route   POST /api/whatsapp/webhook
router.post('/webhook', asyncHandler(async (req, res) => {
    const payload = req.body;

    // Logic to parse Meta/YCloud incoming webhook
    console.log('[WhatsApp Webhook] Incoming payload:', JSON.stringify(payload, null, 2));

    res.status(200).send('EVENT_RECEIVED');
}));

// @desc    Webhook verify token (Meta req)
// @route   GET /api/whatsapp/webhook
router.get('/webhook', (req, res) => {
    const verify_token = process.env.WHATSAPP_VERIFY_TOKEN || 'pgcrm_token';

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === verify_token) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

module.exports = router;
