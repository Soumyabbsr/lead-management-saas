const axios = require('axios');

/**
 * YCloud WhatsApp API Service
 * Docs: https://docs.ycloud.com/reference/whatsapp_message-send-directly
 * 
 * API Base: https://api.ycloud.com/v2
 * Auth: X-API-Key header
 */

const YCLOUD_API_KEY = process.env.YCLOUD_API_KEY;
const YCLOUD_WABA_PHONE_NUMBER_ID = process.env.YCLOUD_WABA_PHONE_NUMBER_ID;
const YCLOUD_BASE_URL = 'https://api.ycloud.com/v2';

/**
 * Format phone number to international format (with country code, with +)
 * Assumes Indian numbers if no country code provided
 */
const formatPhone = (phone) => {
    if (!phone) return null;
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Add + if not present
    if (!cleaned.startsWith('+')) {
        // If 10 digits, assume India
        if (cleaned.length === 10) {
            cleaned = '+91' + cleaned;
        } else if (!cleaned.startsWith('91') && cleaned.length === 10) {
            cleaned = '+91' + cleaned;
        } else {
            cleaned = '+' + cleaned;
        }
    }
    return cleaned;
};

/**
 * Send a WhatsApp template message via YCloud API
 * 
 * @param {string} to - Recipient phone number
 * @param {string} templateName - Approved template name
 * @param {string} languageCode - Template language code (e.g., 'en')
 * @param {Array} bodyParameters - Array of {type: 'text', text: 'value'} objects
 */
const sendTemplate = async (to, templateName, languageCode = 'en', bodyParameters = []) => {
    const phone = formatPhone(to);
    if (!phone) {
        console.error('[YCloud] No valid phone number provided');
        return { success: false, error: 'No valid phone number' };
    }

    if (!YCLOUD_API_KEY) {
        console.log(`[YCloud] SKIPPED (no API key configured) — would send template "${templateName}" to ${phone}`);
        return { success: false, error: 'YCloud API key not configured' };
    }

    try {
        const payload = {
            from: YCLOUD_WABA_PHONE_NUMBER_ID || undefined,
            to: phone,
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
                components: bodyParameters.length > 0 ? [
                    {
                        type: 'body',
                        parameters: bodyParameters,
                    }
                ] : [],
            },
        };

        console.log(`[YCloud] Sending template "${templateName}" to ${phone}...`);

        const response = await axios.post(
            `${YCLOUD_BASE_URL}/whatsapp/messages/sendDirectly`,
            payload,
            {
                headers: {
                    'X-API-Key': YCLOUD_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        const msgId = response.data?.id || response.data?.whatsappMessageId;
        console.log(`[YCloud] ✅ Sent successfully. Message ID: ${msgId}`);
        return { success: true, messageId: msgId, data: response.data };
    } catch (error) {
        const errMsg = error.response?.data?.message || error.response?.data?.error?.message || error.message;
        console.error(`[YCloud] ❌ Failed to send to ${phone}: ${errMsg}`);
        if (error.response?.data) {
            console.error('[YCloud] Response:', JSON.stringify(error.response.data));
        }
        return { success: false, error: errMsg };
    }
};

/**
 * Send a plain text WhatsApp message via YCloud API
 */
const sendMessage = async (to, message) => {
    const phone = formatPhone(to);
    if (!phone) return { success: false, error: 'No valid phone number' };

    if (!YCLOUD_API_KEY) {
        console.log(`[YCloud] SKIPPED (no API key) — would send message to ${phone}: ${message}`);
        return { success: false, error: 'YCloud API key not configured' };
    }

    try {
        const payload = {
            from: YCLOUD_WABA_PHONE_NUMBER_ID || undefined,
            to: phone,
            type: 'text',
            text: { body: message },
        };

        const response = await axios.post(
            `${YCLOUD_BASE_URL}/whatsapp/messages/sendDirectly`,
            payload,
            {
                headers: {
                    'X-API-Key': YCLOUD_API_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );

        const msgId = response.data?.id || response.data?.whatsappMessageId;
        console.log(`[YCloud] ✅ Text sent to ${phone}. ID: ${msgId}`);
        return { success: true, messageId: msgId, data: response.data };
    } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        console.error(`[YCloud] ❌ Text failed to ${phone}: ${errMsg}`);
        return { success: false, error: errMsg };
    }
};

module.exports = {
    sendMessage,
    sendTemplate,
    formatPhone,
};
