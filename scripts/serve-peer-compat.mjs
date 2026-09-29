import { readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { peerAliases, root } from '../tests/peer-compat/aliases.mjs'

const require = createRequire(path.join(root, 'packages/editor-for-vue/package.json'))
const { build, preview } = await import(pathToFileURL(require.resolve('vite')).href)
const legacy = process.argv[2] === 'legacy'
const profile = legacy ? 'legacy' : 'current'
const fixture = path.join(root, 'tests/peer-compat/fixture')
const aliases = readdirSync(path.join(root, 'packages')).map(name => ({
  find: new RegExp(`^@wangeditor-next/${name}$`),
  replacement: path.join(root, `packages/${name}/src/index.ts`),
}))

// Exercise the shipped wrapper code, but use the modular editor so peer aliases
// actually select the engine being tested (the full editor bundles its engine).
for (const name of ['editor-for-react', 'editor-for-vue']) {
  aliases.find(alias => alias.find.test(`@wangeditor-next/${name}`)).replacement = path.join(
    root,
    `packages/${name}/dist/${name === 'editor-for-vue' ? 'index.esm.js' : 'index.mjs'}`
  )
}
const config = {
  configFile: false,
  root: fixture,
  logLevel: 'warn',
  resolve: {
    alias: [
      ...peerAliases(legacy),
      ...aliases,
      { find: /^peer-react-mount$/, replacement: path.join(fixture, `react-${profile}.ts`) },
    ],
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  build: { outDir: path.join(fixture, 'dist', profile), emptyOutDir: true },
}

await build(config)
await preview({
  ...config,
  preview: { host: '127.0.0.1', port: legacy ? 3130 : 3131, strictPort: true },
})
