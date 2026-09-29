import { mergeConfig } from 'vitest/config'

import { peerAliases } from './tests/peer-compat/aliases.mjs'
import base from './vitest.config.mts'

export default mergeConfig({ ...base, test: { ...base.test, include: [] } }, {
  resolve: { alias: peerAliases(true) },
  test: {
    include: [
      'packages/{core,basic-modules,editor,table-module,list-module,upload-image-module,video-module,yjs}/**/*.test.{ts,tsx}',
    ],
    server: { deps: { inline: [/snabbdom/, 'slate-history', 'y-protocols'] } },
  },
})
