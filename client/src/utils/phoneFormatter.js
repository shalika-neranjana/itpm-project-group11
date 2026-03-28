/**
 * Format phone number with spaces as user types
 * Supports both international format (+94 XX XXX XXXX) and local format (07X XXX XXXX)
 */
export const formatPhoneNumber = (value) => {
  if (!value) return '';

  // Remove all non-digit characters except leading +
  let phoneNumber = value.replace(/[^\d+]/g, '');

  // Remove leading + temporarily to work with digits only
  const hasPlus = phoneNumber.startsWith('+');
  if (hasPlus) {
    phoneNumber = phoneNumber.slice(1);
  }

  // Limit to reasonable length (max 15 digits for international)
  phoneNumber = phoneNumber.slice(0, 15);

  // Format based on length and prefix
  let formatted = '';

  if (hasPlus) {
    // International format: +94 70 123 4567
    if (phoneNumber.length <= 2) {
      formatted = '+' + phoneNumber;
    } else if (phoneNumber.length <= 4) {
      formatted = '+' + phoneNumber.slice(0, 2) + ' ' + phoneNumber.slice(2);
    } else if (phoneNumber.length <= 7) {
      formatted = '+' + phoneNumber.slice(0, 2) + ' ' + phoneNumber.slice(2, 4) + ' ' + phoneNumber.slice(4);
    } else {
      formatted = '+' + phoneNumber.slice(0, 2) + ' ' + phoneNumber.slice(2, 4) + ' ' + phoneNumber.slice(4, 7) + ' ' + phoneNumber.slice(7);
    }
  } else {
    // Local format: 076 296 5411 or 070 123 4567
    if (phoneNumber.length <= 3) {
      formatted = phoneNumber;
    } else if (phoneNumber.length <= 6) {
      formatted = phoneNumber.slice(0, 3) + ' ' + phoneNumber.slice(3);
    } else {
      formatted = phoneNumber.slice(0, 3) + ' ' + phoneNumber.slice(3, 6) + ' ' + phoneNumber.slice(6);
    }
  }

  return formatted;
};
