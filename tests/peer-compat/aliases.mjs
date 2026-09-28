import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const require = createRequire(path.join(root, 'package.json'))
const editorRequire = createRequire(path.join(root, 'packages/editor/package.json'))
const reactRequire = createRequire(path.join(root, 'packages/editor-for-react/package.json'))
const vueRequire = createRequire(path.join(root, 'packages/editor-for-vue/package.json'))
const yjsRequire = createRequire(path.join(root, 'packages/yjs/package.json'))

export function peerAliases(legacy) {
  const resolve = (name, from = editorRequire) => from.resolve(name)

  return [
    { find: /^slate$/, replacement: legacy ? resolve('slate-legacy', require) : resolve('slate') },
    {
      find: /^snabbdom$/,
      replacement: legacy ? resolve('snabbdom-legacy', require) : resolve('snabbdom'),
    },
    {
      find: /^yjs$/,
      replacement: (legacy ? resolve('yjs-legacy', require) : resolve('yjs', yjsRequire)).replace(
        /yjs\.cjs$/,
        'yjs.mjs'
      ),
    },
    {
      find: /^@uppy\/core$/,
      replacement: legacy ? resolve('uppy-core-legacy', require) : resolve('@uppy/core'),
    },
    {
      find: /^@uppy\/xhr-upload$/,
      replacement: legacy ? resolve('uppy-xhr-legacy', require) : resolve('@uppy/xhr-upload'),
    },
    {
      find: /^react$/,
      replacement: legacy ? resolve('react-legacy', require) : resolve('react', reactRequire),
    },
    {
      find: /^react-dom$/,
      replacement: legacy
        ? resolve('react-dom-legacy', require)
        : resolve('react-dom', reactRequire),
    },
    { find: /^react-dom\/client$/, replacement: resolve('react-dom/client', reactRequire) },
    {
      find: /^vue$/,
      replacement: path.resolve(
        path.dirname(resolve(legacy ? 'vue-legacy' : 'vue', legacy ? require : vueRequire)),
        'dist/vue.runtime.esm-bundler.js'
      ),
    },
  ]
}
