import 'virtual:uno.css'

import React, { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

const RemoteCursorsOverlayPage = lazy(() => import('./pages/RemoteCursorOverlay'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div data-testid="yjs-demo-loading">Loading...</div>}>
      <RemoteCursorsOverlayPage />
    </Suspense>
  </StrictMode>
)
