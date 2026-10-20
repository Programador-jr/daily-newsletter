function calendarDateKey(value) {
  if (typeof value !== 'string') return null;
  const dayFirst = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dayFirst) {
    const [, day, month, year] = dayFirst;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) return null;
    return `${year}-${month}-${day}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : value;
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Rio_Branco', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

module.exports = { calendarDateKey };
