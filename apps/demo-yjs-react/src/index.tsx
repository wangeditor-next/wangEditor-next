import 'virtual:windi.css'
import 'virtual:windi-devtools'

import React, { lazy, StrictMode, Suspense } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

const RemoteCursorsOverlayPage = lazy(() => import('./pages/RemoteCursorOverlay'))
const routerBaseName = (() => {
  if (import.meta.env.BASE_URL === '/') {
    return undefined
  }

  if (import.meta.env.BASE_URL === './') {
    return window.location.pathname.replace(/\/$/, '') || undefined
  }

  return import.meta.env.BASE_URL.replace(/\/$/, '')
})()

ReactDOM.render(
  <StrictMode>
    <BrowserRouter basename={routerBaseName}>
      <Routes>
        {/* <Route path="/" element={<SimplePage />} /> */}
        <Route
          path="/"
          element={
            <Suspense fallback={<div data-testid="yjs-demo-loading">Loading...</div>}>
              <RemoteCursorsOverlayPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
)
