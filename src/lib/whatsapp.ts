export function buildWhatsAppUrl(number: string, message: string): string {
  // Remove any non-numeric characters from the phone number
  const cleanNumber = number.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

export function getProductEnquiryMessage(
productName: string,
category: string,
price: number,
isSoldOut: boolean)
: string {
  const formattedPrice = `₹${price.toLocaleString('en-IN')}`;
  if (isSoldOut) {
    return `Hi, I saw the ${productName} (${category}) - ${formattedPrice} is marked as Sold Out. Is there any chance it will be available again soon?`;
  }
  return `Hi, I want to buy ${productName} (${category}) - ${formattedPrice}. Is it available?`;
}
