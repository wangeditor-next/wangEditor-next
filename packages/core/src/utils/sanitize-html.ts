/**
 * @description sanitize html before parsing/importing into editor
 * @author Codex
 */

const BLOCKED_TAGS = new Set([
  'base',
  'embed',
  'math',
  'meta',
  'object',
  'script',
  'svg',
  'template',
])

const URL_ATTRS = new Set([
  'href',
  'poster',
  'src',
  'xlink:href',
])

const SCRIPT_SCHEME = ['java', 'script:'].join('')

function normalizeAttrValue(value: string) {
  return Array.from(value)
    .filter(char => char > ' ')
    .join('')
    .toLowerCase()
}

function isSafeUrl(tagName: string, attrName: string, value: string) {
  const normalized = normalizeAttrValue(value)

  if (!normalized) { return true }
  if (normalized.startsWith(SCRIPT_SCHEME) || normalized.startsWith('vbscript:')) { return false }

  if (!normalized.startsWith('data:')) { return true }

  if (attrName === 'href' || attrName === 'xlink:href') { return false }
  if (tagName === 'img' || attrName === 'poster') { return normalized.startsWith('data:image/') }

  return false
}

export function defaultSanitizeHtml(html: string = '') {
  if (!html) { return '' }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const elements = Array.from(doc.body.querySelectorAll('*'))

  elements.forEach(elem => {
    const tagName = elem.tagName.toLowerCase()

    if (BLOCKED_TAGS.has(tagName)) {
      elem.remove()
      return
    }

    Array.from(elem.attributes).forEach(attr => {
      const attrName = attr.name.toLowerCase()
      const attrValue = attr.value || ''

      if (attrName === 'srcdoc' || attrName.startsWith('on')) {
        elem.removeAttribute(attr.name)
        return
      }

      if (URL_ATTRS.has(attrName) && !isSafeUrl(tagName, attrName, attrValue)) {
        elem.removeAttribute(attr.name)
      }
    })
  })

  return doc.body.innerHTML
}
