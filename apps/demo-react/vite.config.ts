import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@wangeditor-next/editor/dist/css/style.css': path.resolve(__dirname, '../../packages/editor/dist/css/style.css'),
      '@wangeditor-next/editor/core': path.resolve(__dirname, '../../packages/editor/dist/core.mjs'),
      // Keep the on-demand demo pointed at the built core package.
      // The core subpath keeps upload runtime APIs out of the on-demand demo.
      '@wangeditor-next/core': path.resolve(__dirname, '../../packages/core/dist/index.mjs'),
    },
  },
  plugins: [react({ fastRefresh: false })],
  server: { open: false },
})
