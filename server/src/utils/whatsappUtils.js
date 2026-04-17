const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

const sendWhatsAppMessage = async (to, message) => {
    try {
        // Format phone number for WhatsApp
        let formattedPhone = to.trim();

        // Skip if phone number is empty after trimming
        if (!formattedPhone) {
            console.log('Skipping WhatsApp message: empty phone number');
            return null;
        }

        // If phone starts with '0', replace with Sri Lanka country code +94
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '+94' + formattedPhone.substring(1);
        }
        // If phone doesn't start with '+', add Sri Lanka country code
        else if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+94' + formattedPhone;
        }

        // Validate that we have a proper phone number (at least 10 digits after country code)
        const phoneDigits = formattedPhone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            console.log('Skipping WhatsApp message: invalid phone number format');
            return null;
        }

        // Ensure the 'to' number is in the format whatsapp:+countrycodephonenumber
        const formattedTo = `whatsapp:${formattedPhone}`;

        const response = await client.messages.create({
            body: message,
            from: whatsappNumber,
            to: formattedTo,
        });

        console.log('WhatsApp message sent:', response.sid);
        return response;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};

module.exports = {
    sendWhatsAppMessage,
};