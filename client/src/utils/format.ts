const valueFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' })
const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

/** Formats a pass value exactly like the server does on the Google Wallet card. */
export function formatPassValue(value: number): string {
  return Number.isFinite(value) ? valueFormat.format(value) : '–'
}

export function formatTime(date: Date | string): string {
  return timeFormat.format(new Date(date))
}

export function formatDate(date: Date | string): string {
  return dateFormat.format(new Date(date))
}

/** Shortens a UUID for display, e.g. 9d2b1c6a…9c0d. */
export function shortId(id: string): string {
  return id.length > 13 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id
}
