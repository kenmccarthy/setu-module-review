/** Small text helpers for generated prose. */

export function joinList(items: string[], conjunction = 'and'): string {
  const list = items.map((s) => s.trim()).filter(Boolean)
  if (list.length === 0) return ''
  if (list.length === 1) return list[0]
  if (list.length === 2) return `${list[0]} ${conjunction} ${list[1]}`
  return `${list.slice(0, -1).join(', ')} ${conjunction} ${list[list.length - 1]}`
}

/** Lower-case the first letter unless the word is an acronym (e.g. "AI literacy"). */
export function lower(s: string): string {
  if (!s || /^[A-Z]{2}/.test(s)) return s
  return s.charAt(0).toLowerCase() + s.slice(1)
}

export function sentence(s: string): string {
  const t = s.trim()
  if (!t) return ''
  const capped = t.charAt(0).toUpperCase() + t.slice(1)
  return /[.!?]$/.test(capped) ? capped : `${capped}.`
}

export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : pluralForm}`
}

export function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })
}
