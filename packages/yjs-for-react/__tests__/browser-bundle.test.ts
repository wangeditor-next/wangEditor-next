import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'

import * as React from 'react'

it('loads the browser UMD bundle with only the documented peer globals', () => {
  const context = {
    React,
    WangEditorYjsModule: {},
    wangEditor: {},
    Slate: {},
  }
  const bundle = readFileSync(resolve(process.cwd(), 'dist/index.js'), 'utf8')

  runInNewContext(bundle, context)
  const exports = (
    context as typeof context & {
      WangEditorYjsForReact: Record<string, unknown>
    }
  ).WangEditorYjsForReact

  expect(typeof exports.useRemoteCursorStatesSelector).toBe('function')
  expect(typeof exports.useRemoteCursorOverlayPositions).toBe('function')
})
