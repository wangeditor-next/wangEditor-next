import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const name = 'WangEditorForVue'
const entry = path.resolve(__dirname, './src/index.ts')

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry,
      name,
      fileName: format => (format === 'es' ? 'index.esm.js' : 'index.js'),
    },
    rollupOptions: {
      external: ['vue', '@wangeditor-next/editor'],
      output: {
        globals: {
          vue: 'Vue',
          '@wangeditor-next/editor': 'wangEditor',
        },
      },
    },
  },
  plugins: [vue(), dts()],
})
