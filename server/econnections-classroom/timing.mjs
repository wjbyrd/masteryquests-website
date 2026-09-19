// Resolve wall time using IANA rules. Reject gaps and ambiguous repeated times
// rather than quietly choosing an offset during a DST transition.
export function zonedInstant(local, timeZone) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) throw new Error('Use YYYY-MM-DDTHH:mm wall times');
  const format = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const nominal = Date.parse(local + ':00Z'), matches = [];
  for (let minutes = -14 * 60; minutes <= 14 * 60; minutes += 15) {
    const candidate = new Date(nominal + minutes * 60000);
    const p = Object.fromEntries(format.formatToParts(candidate).map(p => [p.type, p.value]));
    if (`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}` === local) matches.push(candidate.toISOString());
  }
  if (matches.length !== 1) throw new Error('Wall time is invalid or ambiguous in this timezone');
  return matches[0];
}
