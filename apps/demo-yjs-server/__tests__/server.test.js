const { createServer, getAllowedOrigins, isOriginAllowed } = require('../server')

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
})
