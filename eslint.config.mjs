import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { FlatCompat } from '@eslint/eslintrc'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDirPath = path.dirname(currentFilePath)

const compat = new FlatCompat({
  baseDirectory: currentDirPath,
})

const legacyConfig = {
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
    webextensions: false,
  },
  overrides: [
    {
      files: ['./**/*.ts', './**/*.tsx', './**/*.js', './**/*.jsx'],
      plugins: ['react-hooks'],
      rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
    {
      files: [
        './**/*.ts',
        './**/*.tsx',
        './**/*.js',
        './**/*.jsx',
        './**/*.vue',
        './**/*.cjs',
        './**/*.mjs',
      ],
      plugins: ['html', 'import', '@typescript-eslint', 'simple-import-sort'],
      globals: {
        globalThis: 'readonly',
        vi: 'readonly',
        expect: 'readonly',
      },
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/strongly-recommended',
      ],
      rules: {
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            '': 'never',
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
          },
        ],
        curly: ['error', 'all'],
        'newline-after-var': ['error', 'always'],
        'no-continue': 'off',
        'no-alert': 'off',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        semi: ['error', 'never'],
        'import/order': 'off',
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '..',
                message: 'Import from ../index.js instead.',
              },
              {
                name: '.',
                message: 'Import from ./index.js instead.',
              },
            ],
          },
        ],
        'no-restricted-syntax': [
          'off',
          {
            selector: 'ForOfStatement',
            message: 'Avoid using for...of loops',
          },
          {
            selector: 'YieldExpression',
            message: 'Avoid using generators and yield.',
          },
        ],
        'import/no-extraneous-dependencies': 'off',
        'import/no-unresolved': 'off',
        'import/no-dynamic-require': 'off',
        'arrow-parens': ['error', 'as-needed'],
        'padded-blocks': 'off',
        'class-methods-use-this': 'off',
        'global-require': 'off',
        'func-names': ['error', 'never'],
        'arrow-body-style': 'off',
        'max-len': 'off',
        'no-return-assign': 'off',
        'vue/one-component-per-file': 'off',
        'vue/this-in-template': ['error', 'never'],
        'vue/multi-word-component-names': 'off',
        'vue/max-attributes-per-line': [
          'error',
          {
            singleline: {
              max: 3,
            },
            multiline: {
              max: 1,
            },
          },
        ],
        'vue/singleline-html-element-content-newline': 'off',
        'vue/valid-v-for': 'off',
        'no-param-reassign': 'off',
        'import/prefer-default-export': 'off',
        'consistent-return': 'off',
        'prefer-destructuring': 'off',
        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': ['error'],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],
        'no-dupe-class-members': 'off',
        '@typescript-eslint/no-dupe-class-members': ['error'],
        'lines-between-class-members': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-wrapper-object-types': 'off',
        '@typescript-eslint/no-unsafe-function-type': 'off',
        '@typescript-eslint/explicit-module-boundary-type': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
      },
    },
    {
      files: ['packages/editor/demo/js/**/*.js', 'apps/demo-html/examples/js/**/*.js'],
      rules: {
        'max-classes-per-file': 'off',
        'func-names': 'off',
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        'no-restricted-globals': 'off',
        eqeqeq: 'off',
        'no-plusplus': 'off',
      },
    },
  ],
}

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/lib/**',
      '**/*.html',
      '**/.*/**',
      'packages/code-highlight/src/vendor/**',
    ],
  },
  ...compat.config(legacyConfig),
]
