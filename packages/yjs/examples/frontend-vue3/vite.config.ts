import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import windi from 'vite-plugin-windicss'

export default defineConfig({
  plugins: [vue(), windi()],
  resolve: {
    alias: {
      '@wangeditor-next/yjs-for-vue': resolve(
        __dirname,
        '../../../yjs-for-vue/dist/index.mjs',
      ),
    },
  },
  server: {
    // 启用热更新监听库目录
    watch: {
      ignored: ['!**/src/**'],
    },
  },
})
