const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
const declarations = ['Editor', 'Toolbar'].map(name =>
  path.join(root, `packages/editor-for-vue/dist/components/${name}.vue.d.ts`)
)

for (const legacy of [true, false]) {
  const runtime = legacy ? 'node_modules/vue-legacy' : 'packages/editor-for-vue/node_modules/vue'
  const manifest = JSON.parse(fs.readFileSync(path.join(root, runtime, 'package.json'), 'utf8'))
  const program = ts.createProgram(declarations, {
    noEmit: true,
    strict: true,
    skipLibCheck: false,
    esModuleInterop: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    baseUrl: root,
    paths: { vue: [path.join(runtime, manifest.types)] },
  })
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter(
      diagnostic => diagnostic.file && declarations.includes(path.resolve(diagnostic.file.fileName))
    )

  if (diagnostics.length) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: file => file,
        getCurrentDirectory: () => root,
        getNewLine: () => '\n',
      })
    )
  }
  console.log(`Vue ${manifest.version} published declarations passed.`)
}
