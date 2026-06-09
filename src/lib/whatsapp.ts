import { Order } from './orderTypes';

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

export function getOrderConfirmationMessage(order: Order): string {
  const fullAddress = `${order.address}, ${order.city}, ${order.state} - ${order.pincode}${
    order.landmark ? `, Near ${order.landmark}` : ''
  }`;

  const message = `Hello! I have placed an order on your website.

Order ID: ${order.id}
Product: ${order.productName}
Quantity: ${order.quantity}
Unit Price: ₹${order.productPrice.toLocaleString('en-IN')}
Total Price: ₹${order.totalPrice.toLocaleString('en-IN')}

Customer Details:
Name: ${order.customerName}
Phone: ${order.customerPhone}
${order.customerWhatsapp ? `WhatsApp: ${order.customerWhatsapp}\n` : ''}${order.customerEmail ? `Email: ${order.customerEmail}\n` : ''}Address: ${fullAddress}

Order Status: ${order.orderStatus}
Payment Status: ${order.paymentStatus}

${order.customerNote ? `Special Notes: ${order.customerNote}\n\n` : ''}I would like to complete the payment for this order.`;

  return message;
}

