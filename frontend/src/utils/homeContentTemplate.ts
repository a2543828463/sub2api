// Placeholder rendering for the admin-configured home page HTML.
//
// Supported placeholders: {{ key }} (inner spaces optional) for the keys in
// HOME_CONTENT_KEYS. Values are HTML-escaped before insertion; unknown keys are
// left untouched so unrelated template syntax survives.
//
// Conditional elements: an element carrying data-ccf-if="<key>" is removed when
// that value is empty, otherwise only the attribute is stripped. This part is
// done with a DOM parser (template element), never with regex HTML parsing.

export const HOME_CONTENT_KEYS = [
  'site_name',
  'site_logo',
  'site_subtitle',
  'api_base_url',
  'api_base_root',
  'doc_url',
  'contact_info',
  'year',
] as const

export type HomeContentKey = (typeof HOME_CONTENT_KEYS)[number]

const KNOWN_KEYS = new Set<string>(HOME_CONTENT_KEYS)
const PLACEHOLDER_RE = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g
const CONDITION_ATTR = 'data-ccf-if'

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch])
}

function valueOf(values: Record<string, string>, key: string): string {
  if (!KNOWN_KEYS.has(key)) return ''
  const v = Object.prototype.hasOwnProperty.call(values, key) ? values[key] : ''
  return v == null ? '' : String(v)
}

function applyConditions(template: string, values: Record<string, string>): string {
  // Fast path: keep the original markup byte-for-byte when no conditions exist.
  if (!template.includes(CONDITION_ATTR)) return template
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    return template
  }
  // <template> content is inert: scripts are not executed, images not loaded,
  // and <style> text is preserved verbatim on serialization.
  const tpl = document.createElement('template')
  tpl.innerHTML = template
  const nodes = Array.from(tpl.content.querySelectorAll(`[${CONDITION_ATTR}]`))
  for (const el of nodes) {
    const key = (el.getAttribute(CONDITION_ATTR) || '').trim()
    if (valueOf(values, key).trim() === '') {
      el.remove()
    } else {
      el.removeAttribute(CONDITION_ATTR)
    }
  }
  return tpl.innerHTML
}

export function renderHomeContent(template: string, values: Record<string, string>): string {
  if (!template) return ''
  const conditioned = applyConditions(template, values)
  return conditioned.replace(PLACEHOLDER_RE, (match, key: string) =>
    KNOWN_KEYS.has(key) ? escapeHtml(valueOf(values, key)) : match,
  )
}
