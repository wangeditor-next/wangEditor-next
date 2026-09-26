import path from 'node:path'
import { fileURLToPath } from 'node:url'

// eslint-disable-next-line import/extensions
import { createTsdownConfig } from '../../shared/tsdown-config/index.js'

const packageDir = path.dirname(fileURLToPath(import.meta.url))

export default [
  createTsdownConfig({
    name: 'wangEditorCore',
    packageDir,
    entry: 'src/core.ts',
    outputName: 'core',
    css: true,
  }),
  createTsdownConfig({
    name: 'wangEditorUpload',
    packageDir,
    entry: 'src/upload.ts',
    outputName: 'upload',
  }),
  createTsdownConfig({
    name: 'wangEditor',
    packageDir,
    css: true,
  }),
]
