import { CheckoutFormData, CheckoutValidationErrors } from './orderTypes';

const PHONE_REGEX = /^[0-9\s\-\+\(\)]{10,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PINCODE_REGEX = /^[0-9]{5,6}$/;

export function validateCheckoutForm(
  data: CheckoutFormData,
  availableQuantity: number
): CheckoutValidationErrors {
  const errors: CheckoutValidationErrors = {};

  // Name validation
  if (!data.customerName.trim()) {
    errors.customerName = 'Full name is required';
  } else if (data.customerName.trim().length < 2) {
    errors.customerName = 'Name must be at least 2 characters';
  }

  // Phone validation
  if (!data.customerPhone.trim()) {
    errors.customerPhone = 'Phone number is required';
  } else if (!PHONE_REGEX.test(data.customerPhone)) {
    errors.customerPhone = 'Invalid phone number format';
  }

  // WhatsApp validation (optional, but if provided must be valid)
  if (data.customerWhatsapp.trim() && !PHONE_REGEX.test(data.customerWhatsapp)) {
    errors.customerWhatsapp = 'Invalid WhatsApp number format';
  }

  // Email validation (optional, but if provided must be valid)
  if (data.customerEmail.trim() && !EMAIL_REGEX.test(data.customerEmail)) {
    errors.customerEmail = 'Invalid email address';
  }

  // Address validation
  if (!data.address.trim()) {
    errors.address = 'Delivery address is required';
  } else if (data.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters';
  }

  // City validation
  if (!data.city.trim()) {
    errors.city = 'City is required';
  }

  // State validation
  if (!data.state.trim()) {
    errors.state = 'State is required';
  }

  // Pincode validation
  if (!data.pincode.trim()) {
    errors.pincode = 'Pincode is required';
  } else if (!PINCODE_REGEX.test(data.pincode)) {
    errors.pincode = 'Pincode must be 5-6 digits';
  }

  // Quantity validation
  if (!data.quantity || data.quantity < 1) {
    errors.quantity = 'Quantity must be at least 1';
  } else if (data.quantity > availableQuantity) {
    errors.quantity = `Only ${availableQuantity} items available`;
  }

  return errors;
}

export function hasValidationErrors(errors: CheckoutValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function getValidationErrorMessage(errors: CheckoutValidationErrors, field: string): string {
  return errors[field] || '';
}
