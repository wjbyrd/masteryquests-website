// Spreadsheet-facing representation only. D1 and structured JSON stay unchanged.
export function spreadsheetCell(value) {
  if (typeof value !== 'string') return value;
  return /^(?:\s*[=+@-]|[ \t\r\n]*[\t\r\n])/.test(value) ? "'" + value : value;
}

export function eventRateLimit(value) {
  // Preserve the approved default; reject coercible booleans, fractions and NaN.
  if (!((typeof value === 'string' && /^[0-9]+$/.test(value)) || typeof value === 'number')) return 300;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 50 && parsed <= 10000 ? parsed : 300;
}
