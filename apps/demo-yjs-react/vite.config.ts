import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import windi from 'vite-plugin-windicss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ fastRefresh: false }), windi()],
  server: { open: false },
  resolve: {
    dedupe: ['slate', 'yjs', 'y-protocols'],
  },
})
