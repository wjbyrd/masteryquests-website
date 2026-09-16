// Calendar labels, not instants: never convert the player's clock to UTC.
export function localDate(now = new Date()) {
  return `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const leapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
export function dateParts(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid puzzle date.');
  const [year, month, day] = date.split('-').map(Number);
  const lengths = [31, leapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > lengths[month - 1]) throw new Error('Invalid puzzle date.');
  return { year, month, day, lengths };
}

// Gregorian date-only ordinal. The epoch matches v1's board indexes exactly,
// but no local timestamp subtraction or 24-hour duration is involved.
export function dayNumber(date) {
  const { year, month, day, lengths } = dateParts(date), previous = year - 1;
  return 365 * previous + Math.floor(previous / 4) - Math.floor(previous / 100) + Math.floor(previous / 400)
    + lengths.slice(0, month - 1).reduce((sum, days) => sum + days, 0) + day - 1 - 719162;
}

export function displayDate(date) {
  const { year, month, day } = dateParts(date);
  // Format the label directly so neither UTC conversion nor a timezone change
  // can push it into a neighboring date.
  return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1]} ${day}, ${year}`;
}
