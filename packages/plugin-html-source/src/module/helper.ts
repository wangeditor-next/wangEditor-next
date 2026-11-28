/**
 * @description html-source helpers
 */

/**
 * 格式化编辑器输出的 html ：每个顶级节点单独一行，便于阅读和编辑
 * 只在顶级节点之间换行（setHtml 解析时会忽略顶级节点之间的空白），节点内部内容保持等价。
 * 若存在顶级文本或注释等非元素节点，则原样返回 html 。
 * @param html html string
 */
export function formatHtml(html: string): string {
  // 使用 template 解析：其内容是惰性的，不会加载图片等资源
  const template = document.createElement('template')

  template.innerHTML = html

  const lines: string[] = []

  for (const node of Array.from(template.content.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      lines.push((node as Element).outerHTML)
    } else if (node.nodeType !== Node.TEXT_NODE || (node.textContent || '').trim() !== '') {
      return html
    }
  }

  return lines.join('\n')
}
