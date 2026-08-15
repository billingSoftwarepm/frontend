/**
 * Opens WhatsApp with a prefilled message. If a phone (with country code, no
 * symbols) is supplied it targets that contact, else it opens the chooser.
 */
export function shareOnWhatsApp(message: string, phone?: string) {
  const text = encodeURIComponent(message);
  const cleaned = (phone || '').replace(/[^0-9]/g, '');
  const base = cleaned ? `https://wa.me/${cleaned}` : 'https://wa.me/';
  window.open(`${base}?text=${text}`, '_blank');
}
