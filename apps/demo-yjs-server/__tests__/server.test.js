const { createServer, getAllowedOrigins, isOriginAllowed } = require('../server')
const WebSocket = require('ws')
const { WebsocketProvider } = require('y-websocket')
const Y = require('yjs')
const { docs } = require('@y/websocket-server/utils')

class OriginWebSocket extends WebSocket {
  constructor(url, protocols) {
    super(url, protocols, {
      headers: {
        Origin: 'http://localhost:5173',
      },
    })
  }
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve(server.address().port)
    })
  })
}

describe('demo yjs server origin policy', () => {
  it('allows only loopback origins when ALLOWED_ORIGINS is not configured', () => {
    const allowedOrigins = getAllowedOrigins(undefined)

    expect(isOriginAllowed('http://localhost:5173', allowedOrigins)).toBe(true)
    expect(isOriginAllowed('http://127.0.0.1:5174', allowedOrigins)).toBe(true)
    expect(isOriginAllowed('http://[::1]:5175', allowedOrigins)).toBe(true)
    expect(isOriginAllowed('https://attacker.example', allowedOrigins)).toBe(false)
    expect(isOriginAllowed(undefined, allowedOrigins)).toBe(false)
  })

  it('uses an exact normalized allowlist when ALLOWED_ORIGINS is configured', () => {
    const allowedOrigins = getAllowedOrigins('https://editor.example/, http://localhost:5173')

    expect(allowedOrigins).toEqual(['https://editor.example', 'http://localhost:5173'])
    expect(isOriginAllowed('https://editor.example', allowedOrigins)).toBe(true)
    expect(isOriginAllowed('http://localhost:5174', allowedOrigins)).toBe(false)
  })

  it('rejects empty and invalid configured origin lists', () => {
    expect(() => getAllowedOrigins('')).toThrow(
      'ALLOWED_ORIGINS must contain at least one HTTP(S) origin'
    )
    expect(() => getAllowedOrigins('https://editor.example/path')).toThrow('invalid HTTP(S) origin')
  })

  it('rejects an unapproved WebSocket upgrade before handling it', () => {
    const server = createServer({ allowedOrigins: ['https://editor.example'] })
    const socket = {
      destroy: vi.fn(),
      write: vi.fn(),
    }

    server.emit(
      'upgrade',
      { headers: { origin: 'https://attacker.example' } },
      socket,
      Buffer.alloc(0)
    )

    expect(socket.write).toHaveBeenCalledWith('HTTP/1.1 403 Forbidden\r\n\r\n')
    expect(socket.destroy).toHaveBeenCalledOnce()
  })

  it('initializes documents and synchronizes updates between providers', async () => {
    const server = createServer()
    const port = await listen(server)
    const room = `server-test-${Date.now()}`
    const firstDoc = new Y.Doc()
    const secondDoc = new Y.Doc()
    const firstProvider = new WebsocketProvider(`ws://127.0.0.1:${port}`, room, firstDoc, {
      WebSocketPolyfill: OriginWebSocket,
      disableBc: true,
    })
    const secondProvider = new WebsocketProvider(`ws://127.0.0.1:${port}`, room, secondDoc, {
      WebSocketPolyfill: OriginWebSocket,
      disableBc: true,
    })

    try {
      await vi.waitFor(() => {
        expect(firstProvider.synced).toBe(true)
        expect(secondProvider.synced).toBe(true)
      })

      const firstContent = firstDoc.get('content', Y.XmlText)
      const secondContent = secondDoc.get('content', Y.XmlText)

      expect(firstContent.length).toBe(1)
      expect(secondContent.length).toBe(1)
      const firstParagraph = firstContent.toDelta()[0].insert
      const secondParagraph = secondContent.toDelta()[0].insert

      expect(firstParagraph.getAttribute('type')).toBe('paragraph')
      expect(secondParagraph.getAttribute('type')).toBe('paragraph')

      firstParagraph.insert(0, 'hello')
      await vi.waitFor(() => expect(secondParagraph.toString()).toBe('hello'))
      secondParagraph.insert(5, ' world')
      await vi.waitFor(() => expect(firstParagraph.toString()).toBe('hello world'))

      firstProvider.awareness.setLocalStateField('user', { name: 'Alice' })
      await vi.waitFor(() => {
        expect(secondProvider.awareness.getStates().get(firstDoc.clientID).user).toEqual({
          name: 'Alice',
        })
      })
      firstProvider.disconnect()
      await vi.waitFor(() => {
        expect(secondProvider.awareness.getStates().has(firstDoc.clientID)).toBe(false)
      })
      firstProvider.connect()
      await vi.waitFor(() => expect(firstProvider.synced).toBe(true))
      expect(firstContent.length).toBe(1)
      expect(firstParagraph.toString()).toBe('hello world')
    } finally {
      firstProvider.destroy()
      secondProvider.destroy()
      firstDoc.destroy()
      secondDoc.destroy()
      await new Promise(resolve => server.close(resolve))
      docs.get(room)?.destroy()
      docs.delete(room)
    }
  })
})
