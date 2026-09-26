import path from 'node:path'
import { fileURLToPath } from 'node:url'

// eslint-disable-next-line import/extensions
import { createTsdownConfig } from '../../shared/tsdown-config/index.js'

export default createTsdownConfig({
  name: 'WangEditorYjsForVue',
  packageDir: path.dirname(fileURLToPath(import.meta.url)),
  umdGlobals: { slate: 'Slate', vue: 'Vue' },
})
