/**
 * @description normalize link url
 * @author OpenAI
 */

const URL_FORMATTING_WHITESPACE_REGEX = /[\t\n\f\r]+/g
const URL_SPACE_REGEX = / /g

/**
 * Normalize URLs imported from HTML editors such as Microsoft Office.
 * Formatting whitespace inside href values should not survive as literal
 * line breaks, while real spaces should be serialized as %20.
 */
export function normalizeLinkUrl(url: string): string {
  const normalizedUrl = url.replace(URL_FORMATTING_WHITESPACE_REGEX, '').trim()

  if (normalizedUrl.indexOf(' ') < 0) {
    return normalizedUrl
  }

  return normalizedUrl.replace(URL_SPACE_REGEX, '%20')
}
