import path from 'node:path'
import { fileURLToPath } from 'node:url'

// eslint-disable-next-line import/extensions
import { createTsdownConfig } from '../../shared/tsdown-config/index.js'

const packageDir = path.dirname(fileURLToPath(import.meta.url))

export default [
  createTsdownConfig({
    name: 'WangEditorCore',
    packageDir,
    css: true,
  }),
  createTsdownConfig({
    name: 'WangEditorCoreUpload',
    packageDir,
    entry: 'src/upload.ts',
    outputName: 'upload',
  }),
]
