export function buildWhatsAppUrl(number: string, message: string): string {
  // Remove any non-numeric characters from the phone number
  const cleanNumber = number.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

export function getProductEnquiryMessage(
productName: string,
category: string,
isSoldOut: boolean)
: string {
  if (isSoldOut) {
    return `Hi, I saw the ${productName} (${category}) is marked as Sold Out. Is there any chance it will be available again soon?`;
  }
  return `Hi, I am interested in buying ${productName} from the ${category} collection. Is it available?`;
}