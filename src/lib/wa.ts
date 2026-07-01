// WhatsApp helpers. Phone is stored as digits only (E.164 without +), e.g. "5511999999999".
export function buildWhatsappUrl(phoneDigits: string, message: string): string {
  const cleanPhone = phoneDigits.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function digitsOnly(input: string): string {
  return input.replace(/\D/g, "");
}
