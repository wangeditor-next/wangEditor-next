import 'virtual:windi.css'
import 'virtual:windi-devtools'

import React, { lazy, StrictMode, Suspense } from 'react'
import ReactDOM from 'react-dom'

const RemoteCursorsOverlayPage = lazy(() => import('./pages/RemoteCursorOverlay'))

ReactDOM.render(
  <StrictMode>
    <Suspense fallback={<div data-testid="yjs-demo-loading">Loading...</div>}>
      <RemoteCursorsOverlayPage />
    </Suspense>
  </StrictMode>,
  document.getElementById('root')
)
