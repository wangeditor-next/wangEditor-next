#!/usr/bin/env node

const http = require('node:http')

const { WebSocketServer } = require('ws')
const { getYDoc, setupWSConnection } = require('y-websocket/bin/utils')
const Y = require('yjs')

const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])

function parseOrigin(value) {
  if (typeof value !== 'string') {
    return null
  }

  try {
    const origin = new URL(value)
    const isHttpOrigin = origin.protocol === 'http:' || origin.protocol === 'https:'
    const hasOnlyOriginParts =
      origin.pathname === '/' &&
      !origin.search &&
      !origin.hash &&
      !origin.username &&
      !origin.password

    return isHttpOrigin && hasOnlyOriginParts ? origin : null
  } catch {
    return null
  }
}

function getAllowedOrigins(value) {
  if (value === undefined) {
    return null
  }

  const configuredOrigins = value
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)

  if (configuredOrigins.length === 0) {
    throw new Error('ALLOWED_ORIGINS must contain at least one HTTP(S) origin')
  }

  return Array.from(
    new Set(
      configuredOrigins.map(configuredOrigin => {
        const origin = parseOrigin(configuredOrigin)

        if (origin === null) {
          throw new Error(`ALLOWED_ORIGINS contains an invalid HTTP(S) origin: ${configuredOrigin}`)
        }

        return origin.origin
      })
    )
  )
}

function isOriginAllowed(origin, allowedOrigins) {
  const parsedOrigin = parseOrigin(origin)

  if (parsedOrigin === null) {
    return false
  }

  if (allowedOrigins !== null) {
    return allowedOrigins.includes(parsedOrigin.origin)
  }

  return LOOPBACK_HOSTNAMES.has(parsedOrigin.hostname)
}

function getDocumentName(request) {
  return (request.url || '').slice(1).split('?')[0]
}

function initializeDocument(documentName) {
  const document = getYDoc(documentName)
  const sharedRoot = document.get('content', Y.XmlText)

  if (sharedRoot.length === 0) {
    const paragraph = new Y.XmlText()

    paragraph.setAttribute('type', 'paragraph')
    sharedRoot.insertEmbed(0, paragraph)
  }
}

function createServer({ allowedOrigins = null } = {}) {
  if (allowedOrigins !== null && allowedOrigins.length === 0) {
    throw new Error('allowedOrigins must be null or contain at least one origin')
  }

  const webSocketServer = new WebSocketServer({ noServer: true })

  webSocketServer.on('connection', (socket, request) => {
    const documentName = getDocumentName(request)

    initializeDocument(documentName)
    setupWSConnection(socket, request, { docName: documentName })
  })

  const server = http.createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' })
    response.end('okay')
  })

  server.on('upgrade', (request, socket, head) => {
    if (!isOriginAllowed(request.headers.origin, allowedOrigins)) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
      socket.destroy()
      return
    }

    webSocketServer.handleUpgrade(request, socket, head, webSocket => {
      webSocketServer.emit('connection', webSocket, request)
    })
  })

  return server
}

function startServer() {
  const host = process.env.HOST || 'localhost'
  const port = Number.parseInt(process.env.PORT || '1234', 10)
  const server = createServer({
    allowedOrigins: getAllowedOrigins(process.env.ALLOWED_ORIGINS),
  })

  server.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`y-websocket server running at '${host}' on port ${port}`)
  })

  return server
}

if (require.main === module) {
  startServer()
}

module.exports = {
  createServer,
  getAllowedOrigins,
  isOriginAllowed,
}
