import fs from 'node:fs'
import path from 'node:path'

import babel from '@rollup/plugin-babel'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import discardDuplicates from 'postcss-discard-duplicates'
import mergeRules from 'postcss-merge-rules'
import postcss from 'rollup-plugin-postcss'

const INTERNAL_UMD_GLOBALS = {
  '@wangeditor-next/basic-modules': 'WangEditorBasicModules',
  '@wangeditor-next/code-highlight': 'WangEditorCodeHighLight',
  '@wangeditor-next/core': 'WangEditorCore',
  '@wangeditor-next/editor': 'wangEditor',
  '@wangeditor-next/list-module': 'WangEditorListModule',
  '@wangeditor-next/table-module': 'WangEditorTableModule',
  '@wangeditor-next/upload-image-module': 'WangEditorUploadImageModule',
  '@wangeditor-next/video-module': 'WangEditorVideoModule',
}

const EXTERNAL_UMD_GLOBALS = {
  '@uppy/core': 'Uppy',
  '@uppy/xhr-upload': 'XHRUpload',
  dom7: '$',
  'is-hotkey': 'isHotkey',
  'lodash.camelcase': 'camelCase',
  'lodash.clonedeep': 'cloneDeep',
  'lodash.debounce': 'debounce',
  'lodash.foreach': 'forEach',
  'lodash.throttle': 'throttle',
  'lodash.toarray': 'toArray',
  nanoid: 'nanoid',
  slate: 'slate',
  snabbdom: 'snabbdom',
  yjs: 'Y',
}

const isProduction = process.env.NODE_ENV === 'production'
const extensions = ['.js', '.jsx', '.ts', '.tsx']

function toGlobalName(id) {
  return INTERNAL_UMD_GLOBALS[id] || EXTERNAL_UMD_GLOBALS[id] || id.replace(/[^a-zA-Z0-9_$]/g, '_')
}

/**
 * Build a package with the same public ESM/UMD filenames as the Rollup setup.
 * Declaration output is generated once by the ESM build; UMD is runtime-only.
 */
export function createTsdownConfig({
  name,
  packageDir = process.cwd(),
  entry = 'src/index.ts',
  css = false,
}) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'))
  const peerDependencies = Object.keys(packageJson.peerDependencies || {})
  const dependencies = Object.keys(packageJson.dependencies || {})
  const external = new Set(peerDependencies)
  const noExternal = dependencies.map(
    dependency => new RegExp(`^${dependency.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/|$)`)
  )
  const globals = Object.fromEntries(
    peerDependencies.map(dependency => [dependency, toGlobalName(dependency)])
  )

  const plugins = [
    babel({
      rootMode: 'upward',
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
      include: 'src/**',
      extensions,
    }),
    ...(css
      ? [
          postcss({
            plugins: [
              autoprefixer(),
              discardDuplicates(),
              mergeRules(),
              ...(isProduction ? [cssnano()] : []),
            ],
            extract: 'css/style.css',
          }),
        ]
      : []),
  ]

  const common = {
    cwd: packageDir,
    entry: { index: entry },
    platform: 'browser',
    // Rolldown accepts ES2015+ targets. The repository already excludes IE 11
    // from browserslist, so this is the closest supported target to the old
    // TypeScript/Babel output without adding a second transpilation pass.
    target: 'es2015',
    minify: isProduction,
    sourcemap: true,
    outDir: 'dist',
    globalName: name,
    external: id =>
      [...external].some(dependency => id === dependency || id.startsWith(`${dependency}/`)),
    noExternal,
    plugins,
    outputOptions: { globals },
  }

  return [
    {
      ...common,
      format: 'esm',
      dts: true,
      outExtensions: () => ({ js: '.mjs', dts: '.d.ts' }),
    },
    {
      ...common,
      format: 'umd',
      dts: false,
      outputOptions: {
        entryFileNames: 'index.js',
        globals,
      },
    },
  ]
}
