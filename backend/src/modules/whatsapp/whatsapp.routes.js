const express = require('express');
const asyncHandler = require('express-async-handler');
const { sendMessage, sendTemplate } = require('./whatsapp.service');
const { protect } = require('../../middlewares/auth.middleware');

const router = express.Router();

// @desc    Send a custom text message via WhatsApp (YCloud)
// @route   POST /api/whatsapp/send
router.post('/send', protect, asyncHandler(async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        res.status(400);
        throw new Error('Please provide "to" and "message" fields');
    }

    const result = await sendMessage(to, message);
    res.status(result.success ? 200 : 400).json(result);
}));

// @desc    Send a template message via WhatsApp (YCloud)
// @route   POST /api/whatsapp/send-template
router.post('/send-template', protect, asyncHandler(async (req, res) => {
    const { to, templateName, languageCode, parameters } = req.body;

    if (!to || !templateName) {
        res.status(400);
        throw new Error('Please provide "to" and "templateName" fields');
    }

    const bodyParams = (parameters || []).map(p => ({ type: 'text', text: String(p) }));
    const result = await sendTemplate(to, templateName, languageCode || 'en', bodyParams);
    res.status(result.success ? 200 : 400).json(result);
}));

// @desc    YCloud Webhook — receives delivery status updates and inbound messages
// @route   POST /api/whatsapp/webhook
// Docs: https://docs.ycloud.com/reference/configure-webhooks
// YCloud sends events like: whatsapp.message.updated, whatsapp.inbound_message.received
router.post('/webhook', (req, res) => {
    const payload = req.body;

    console.log('[YCloud Webhook] Event received:', payload?.type || 'unknown');

    // Handle different event types
    if (payload?.type === 'whatsapp.message.updated') {
        const msg = payload?.whatsappMessage;
        console.log(`[YCloud Webhook] Message ${msg?.id} status: ${msg?.status}`);
    } else if (payload?.type === 'whatsapp.inbound_message.received') {
        const msg = payload?.whatsappInboundMessage;
        console.log(`[YCloud Webhook] Inbound from ${msg?.from}: ${msg?.text?.body || '[media]'}`);
    }

    // Always respond 200 to acknowledge receipt
    res.status(200).json({ received: true });
});

module.exports = router;
