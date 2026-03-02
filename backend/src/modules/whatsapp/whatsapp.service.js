const asyncHandler = require('express-async-handler');

/**
 * Service stub for WhatsApp integration.
 * In production, this would connect to Meta Cloud API or YCloud.
 */

const sendMessage = async (to, message) => {
    console.log(`[WhatsApp Stub] Sending message to ${to}: ${message}`);
    // Implement actual API call here
    return { success: true, messageId: 'stub_id_123' };
};

const sendTemplate = async (to, templateName, components) => {
    console.log(`[WhatsApp Stub] Sending template ${templateName} to ${to}`);
    // Implement actual template API call here
    return { success: true, messageId: 'stub_id_template_456' };
};

module.exports = {
    sendMessage,
    sendTemplate,
};
