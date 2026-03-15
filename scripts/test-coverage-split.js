const { spawnSync } = require('node:child_process')
const path = require('node:path')

const defaultThresholds = {
  lines: 2,
  functions: 2,
  branches: 1,
  statements: 2,
}

const thresholdsByRun = {
  core: {
    lines: 10,
    functions: 8,
    branches: 5,
    statements: 10,
  },
  editor: {
    lines: 5,
    functions: 5,
    branches: 3,
    statements: 5,
  },
  'basic-modules': {
    lines: 10,
    functions: 8,
    branches: 5,
    statements: 10,
  },
  'list-module': {
    lines: 8,
    functions: 6,
    branches: 4,
    statements: 8,
  },
  'table-module-menu': {
    lines: 6,
    functions: 5,
    branches: 3,
    statements: 6,
  },
  'table-module-other': {
    lines: 6,
    functions: 5,
    branches: 3,
    statements: 6,
  },
  'upload-image-module': {
    lines: 6,
    functions: 5,
    branches: 3,
    statements: 6,
  },
  'video-module': {
    lines: 6,
    functions: 5,
    branches: 3,
    statements: 6,
  },
  'code-highlight': {
    lines: 6,
    functions: 5,
    branches: 3,
    statements: 6,
  },
  'plugin-markdown': {
    lines: 4,
    functions: 3,
    branches: 2,
    statements: 4,
  },
}

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
  { name: 'editor-for-react', paths: ['packages/editor-for-react/__tests__'] },
  { name: 'plugin-float-image', paths: ['packages/plugin-float-image/__tests__'] },
  { name: 'plugin-formula', paths: ['packages/plugin-formula/__tests__'] },
  { name: 'plugin-link-card', paths: ['packages/plugin-link-card/__tests__'] },
  { name: 'plugin-markdown', paths: ['packages/plugin-markdown/__tests__'] },
  { name: 'plugin-mention', paths: ['packages/plugin-mention/__tests__'] },
  { name: 'yjs', paths: ['packages/yjs/__tests__'] },
  { name: 'yjs-for-react', paths: ['packages/yjs-for-react/__tests__'] },
  { name: 'yjs-for-vue', paths: ['packages/yjs-for-vue/__tests__'] },
].map(run => ({
  ...run,
  thresholds: thresholdsByRun[run.name] || defaultThresholds,
}))

const baseArgs = [
  'vitest',
  'run',
  '--passWithNoTests',
  '--coverage',
]

runs.forEach(({ name, paths, thresholds }) => {
  const thresholdArgs = [
    '--coverage.thresholds.lines',
    thresholds.lines.toString(),
    '--coverage.thresholds.functions',
    thresholds.functions.toString(),
    '--coverage.thresholds.branches',
    thresholds.branches.toString(),
    '--coverage.thresholds.statements',
    thresholds.statements.toString(),
  ]

  const args = [
    ...baseArgs,
    ...thresholdArgs,
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
