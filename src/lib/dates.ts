/** "Feb 2026 – Present" in the given locale. Dates are civil (UTC) dates. */
export function formatPeriod(
  start: Date,
  end: Date | null | undefined,
  locale: string,
  presentLabel: string,
): string {
  const fmt = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' })
  return `${fmt.format(start)} – ${end ? fmt.format(end) : presentLabel}`
}
