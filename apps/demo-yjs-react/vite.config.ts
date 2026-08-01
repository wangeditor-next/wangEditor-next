import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import windi from 'vite-plugin-windicss'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')

  return {
    base: env.VITE_YJS_DEMO_BASE_PATH || '/',
    plugins: [react({ fastRefresh: false }), windi()],
    server: { open: false },
    resolve: {
      dedupe: ['slate', 'yjs', 'y-protocols'],
    },
  }
})
