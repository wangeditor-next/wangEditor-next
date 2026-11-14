import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const fixtureDir = path.resolve(__dirname, 'fixtures/jsx-runtime')
const buildConfigUrl = pathToFileURL(
  path.resolve(__dirname, '../../../shared/tsdown-config/index.js')
).href

describe('published JSX rendering', () => {
  beforeAll(() => {
    execFileSync(process.execPath, ['--input-type=module', '--eval', [
      "import { build } from 'tsdown'",
      `import { createTsdownConfig } from ${JSON.stringify(buildConfigUrl)}`,
      "await build({ ...createTsdownConfig({ name: 'JsxRuntimeFixture', entry: 'src/index.tsx' }), dts: false })",
    ].join('\n')], {
      cwd: fixtureDir,
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'pipe',
      timeout: 60_000,
    })
  }, 60_000)

  it.each(['esm', 'umd'])('renders JSX from the actual %s build without global factories', format => {
    const entry = pathToFileURL(path.join(fixtureDir, 'dist/index.mjs')).href
    const umdEntry = path.join(fixtureDir, 'dist/index.js')
    const script = [
      'globalThis.window = {}',
      format === 'esm'
        ? `const built = await import(${JSON.stringify(entry)})`
        : [
          "const { readFileSync } = await import('node:fs')",
          "const { runInNewContext } = await import('node:vm')",
          "const snabbdom = await import('snabbdom')",
          'const context = { snabbdom }',
          `runInNewContext(readFileSync(${JSON.stringify(umdEntry)}, 'utf8'), context)`,
          'const built = context.JsxRuntimeFixture',
        ].join('\n'),
      "process.stdout.write(JSON.stringify(built.renderImage('lazy')))",
    ].join('\n')
    const vnode = JSON.parse(execFileSync(
      process.execPath,
      ['--input-type=module', '--eval', script],
      { cwd: fixtureDir, encoding: 'utf8', stdio: 'pipe', timeout: 60_000 }
    ))

    expect(vnode.sel).toBe('div')
    expect(vnode.data.className).toBe('image-container')
    expect(vnode.children[0].sel).toBe('img')
    expect(vnode.children[0].data.loading).toBe('lazy')
  })
})
