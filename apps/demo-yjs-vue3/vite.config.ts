import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig, loadEnv } from 'vite'
import windi from 'vite-plugin-windicss'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')

  return {
    base: env.VITE_YJS_DEMO_BASE_PATH || '/',
    plugins: [vue(), windi()],
    resolve: {
      alias: {
        '@wangeditor-next/yjs-for-vue': resolve(
          __dirname,
          '../../packages/yjs-for-vue/dist/index.mjs'
        ),
      },
    },
    server: {
      // 启用热更新监听库目录
      watch: {
        ignored: ['!**/src/**'],
      },
    },
  }
})
