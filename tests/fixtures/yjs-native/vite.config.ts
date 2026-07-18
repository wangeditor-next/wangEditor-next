import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    dedupe: ['slate', 'yjs', 'y-protocols'],
  },
})
