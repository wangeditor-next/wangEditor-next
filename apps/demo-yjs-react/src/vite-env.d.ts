/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YJS_DEMO_MODE?: string
  readonly VITE_YJS_WEBSOCKET_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
