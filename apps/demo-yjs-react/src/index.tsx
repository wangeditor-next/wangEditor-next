import 'virtual:windi.css'
import 'virtual:windi-devtools'

import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter, Route, Routes,
} from 'react-router-dom'

import { RemoteCursorsOverlayPage } from './pages/RemoteCursorOverlay'

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<SimplePage />} /> */}
        <Route path="/" element={<RemoteCursorsOverlayPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root'),
)
