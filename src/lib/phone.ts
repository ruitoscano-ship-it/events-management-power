export function normalizePhone(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidPhone(phone: string): boolean {
  const digits = normalizePhone(phone)
  return digits.length >= 9 && digits.length <= 15
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}
