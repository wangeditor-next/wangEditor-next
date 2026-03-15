import '@testing-library/jest-dom'

import nodeCrypto from 'crypto'

import { DataTransfer } from './DataTransfer'
import { ResizeObserver } from './ResizeObserver'

// @ts-ignore
if (!global.crypto) {
  // @ts-ignore
  global.crypto = {
    getRandomValues(buffer: any) {
      return nodeCrypto.randomFillSync(buffer)
    },
  }
}

vi.spyOn(global.console, 'warn').mockImplementation(() => vi.fn())
vi.spyOn(global.console, 'error').mockImplementation(() => vi.fn())

// Jest environment not contains DataTransfer object, so mock a DataTransfer class
// @ts-ignore
global.DataTransfer = DataTransfer

global.ResizeObserver = ResizeObserver

const zeroRect = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
}

if (!Range.prototype.getClientRects) {
  Range.prototype.getClientRects = () => [zeroRect] as any
}

if (!Range.prototype.getBoundingClientRect) {
  Range.prototype.getBoundingClientRect = () => zeroRect as any
}

afterEach(() => {
  const globalScope = globalThis as any
  const editors: Set<any> | undefined = globalScope.testEditors

  if (editors) {
    editors.forEach(editor => {
      try {
        editor.destroy?.()
      } catch (error) {
        console.error(error)
      }
    })
    editors.clear()
  }

  document.body.innerHTML = ''
})
