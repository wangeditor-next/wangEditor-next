const { spawnSync } = require('node:child_process')
const path = require('node:path')

const runs = [
  { name: 'core', paths: ['packages/core/__tests__'] },
  { name: 'editor', paths: ['packages/editor/__tests__'] },
  { name: 'basic-modules', paths: ['packages/basic-modules/__tests__'] },
  { name: 'list-module', paths: ['packages/list-module/__tests__'] },
  { name: 'table-module-menu', paths: ['packages/table-module/__tests__/menu'] },
  {
    name: 'table-module-other',
    paths: [
      'packages/table-module/__tests__/utils',
      'packages/table-module/__tests__/elem-to-html.test.ts',
      'packages/table-module/__tests__/render-elem.test.ts',
      'packages/table-module/__tests__/parse-html.test.ts',
      'packages/table-module/__tests__/row-resize.test.ts',
      'packages/table-module/__tests__/batch-selection-simple.test.ts',
      'packages/table-module/__tests__/plugin.test.ts',
      'packages/table-module/__tests__/helper.test.ts',
    ],
  },
  { name: 'upload-image-module', paths: ['packages/upload-image-module/__tests__'] },
  { name: 'video-module', paths: ['packages/video-module/__tests__'] },
  { name: 'code-highlight', paths: ['packages/code-highlight/__tests__'] },
]

const baseArgs = [
  'vitest',
  'run',
  '--passWithNoTests',
  '--dangerouslyIgnoreUnhandledErrors',
  '--coverage',
]

runs.forEach(({ name, paths }) => {
  const args = [
    ...baseArgs,
    '--coverage.reportsDirectory',
    path.join('coverage', name),
    ...paths,
  ]
  const result = spawnSync('pnpm', args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--unhandled-rejections=warn',
    },
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
})
