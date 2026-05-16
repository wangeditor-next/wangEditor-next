import { createRollupConfig } from '@wangeditor-next-shared/rollup-config'

import pkg from './package.json' with { type: 'json' }

const configList = []

function createDualFormatConfig(input, umdFile, esmFile, name) {
  const esmConf = createRollupConfig({
    input,
    output: {
      file: esmFile,
      format: 'esm',
      name,
    },
  })

  configList.push(esmConf)

  const umdConf = createRollupConfig({
    input,
    output: {
      file: umdFile,
      format: 'umd',
      name,
    },
  })

  configList.push(umdConf)
}

createDualFormatConfig('src/index.ts', pkg.main, pkg.module, 'WangEditorCore')
createDualFormatConfig('src/upload.ts', 'dist/upload.js', 'dist/upload.mjs', 'WangEditorCoreUpload')

export default configList
