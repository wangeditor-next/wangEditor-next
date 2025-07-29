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
