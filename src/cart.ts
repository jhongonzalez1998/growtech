import { CartItem } from './types';

export const generateWhatsappLink = (cart: CartItem[]): string => {
  const phoneNumber = "593978941301";
  
  let message = "¡Hola Growtech! Quisiera realizar un pedido:\n\n";
  
  let total = 0;
  cart.forEach(item => {
    
    message += `- ${item.name} (Cod: ${item.whatsappCode}) x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    total += item.price * item.quantity;
  });

  message += `\n*Total a pagar: $${total.toFixed(2)}*\n\n`;
  message += "Ayudame con el link de pago para completar la compra, ¡Gracias!";
  
  // IMPORTANTE: encodeURIComponent es lo que limpia el mensaje para WhatsApp
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};
