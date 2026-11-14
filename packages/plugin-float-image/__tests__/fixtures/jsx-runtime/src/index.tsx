// The factory is referenced only by JSX, as in the published image renderer.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx, VNode } from 'snabbdom'

export function renderImage(loading: 'lazy' | 'eager'): VNode {
  return (
    <div className="image-container">
      <img src="image.png" loading={loading} />
    </div>
  )
}
