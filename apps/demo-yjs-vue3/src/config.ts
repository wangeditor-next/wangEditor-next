const DEFAULT_YJS_WEBSOCKET_URL = 'ws://localhost:1234'

export function getYjsWebsocketUrl(value = import.meta.env.VITE_YJS_WEBSOCKET_URL): string {
  if (!value) {
    return DEFAULT_YJS_WEBSOCKET_URL
  }

  const url = new URL(value)

  if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
    throw new Error('VITE_YJS_WEBSOCKET_URL must use the ws: or wss: protocol')
  }

  return url.href.replace(/\/$/, '')
}

export const YJS_WEBSOCKET_URL = getYjsWebsocketUrl()
