export function indiaIsoDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  if (!values.year || !values.month || !values.day) {
    throw new Error("Could not resolve the India calendar date.");
  }
  return `${values.year}-${values.month}-${values.day}`;
}

export function formatScheduleDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${isoDate}T00:00:00+05:30`));
}

export function indiaYearMonth(now = new Date()): string {
  return indiaIsoDate(now).slice(0, 7);
}

export function formatMonthLabel(month: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "long",
    year: "numeric",
  }).format(new Date(`${month}-01T00:00:00+05:30`));
}

export function formatRecordedAt(timestamp: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}
