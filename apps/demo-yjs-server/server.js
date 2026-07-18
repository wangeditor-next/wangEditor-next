#!/usr/bin/env node

const http = require('node:http')

const { WebSocketServer } = require('ws')
const { getYDoc, setupWSConnection } = require('y-websocket/bin/utils')
const Y = require('yjs')

const host = process.env.HOST || 'localhost'
const port = Number.parseInt(process.env.PORT || '1234', 10)
const webSocketServer = new WebSocketServer({ noServer: true })

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
  webSocketServer.handleUpgrade(request, socket, head, webSocket => {
    webSocketServer.emit('connection', webSocket, request)
  })
})

server.listen(port, host, () => {
  console.log(`y-websocket server running at '${host}' on port ${port}`)
})
