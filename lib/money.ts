/** Convert user-entered major units to integer minor units without floating point arithmetic. */
export function majorToMinor(value: string): number {
  const normalized = value.trim().replace(',', '.');
  const match = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) throw new Error('Введите цену числом, например 799 или 799,90.');
  const result = Number(match[1]) * 100 + Number((match[2] || '').padEnd(2, '0'));
  if (!Number.isSafeInteger(result) || result > 100000000) throw new Error('Цена слишком большая.');
  return result;
}
export function minorToMajor(value: number): string {
  const whole = Math.floor(value / 100);
  const fraction = String(value % 100).padStart(2, '0');
  return fraction === '00' ? String(whole) : `${whole},${fraction}`;
}
export function currencyLabel(currency: string): string {
  return ({ rub: '₽', usd: '$', eur: '€' } as Record<string, string>)[currency] || currency.toUpperCase();
}
