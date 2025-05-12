
/**
 * Formats a phone number into (xxx)-xxx-xxxx format
 * @param phone The phone number to format
 * @returns Formatted phone number or empty string if invalid
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if we have enough digits for a US phone number
  if (cleaned.length < 10) return cleaned;
  
  // Format as (xxx)-xxx-xxxx
  const areaCode = cleaned.substring(0, 3);
  const middle = cleaned.substring(3, 6);
  const last = cleaned.substring(6, 10);
  
  return `(${areaCode})-${middle}-${last}`;
}

/**
 * Formats a phone number for display, handling null/undefined values gracefully
 */
export function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) return 'Not provided';
  return formatPhoneNumber(phone);
}

