import { createRoot } from 'react-dom/client'

export function mount(element: any, container: Element) {
  const root = createRoot(container)

  root.render(element)
  return root
}
