const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const port = Number(process.env.PORT || 8881)
const examplesDir = path.join(__dirname, 'examples')
const editorDistDir = path.join(__dirname, '../../packages/editor/dist')

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
}

function sendFile(filePath, res) {
  const ext = path.extname(filePath)
  const contentType = contentTypes[ext] || 'application/octet-stream'

  fs.createReadStream(filePath)
    .on('error', () => {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Internal Server Error')
    })
    .once('open', () => {
      res.writeHead(200, { 'Content-Type': contentType })
    })
    .pipe(res)
}

function resolvePath(urlPath) {
  if (urlPath === '/' || urlPath === '') {
    return { redirect: '/examples/' }
  }

  if (urlPath === '/examples' || urlPath === '/examples/') {
    return { filePath: path.join(examplesDir, 'index.html') }
  }

  if (urlPath.startsWith('/examples/')) {
    return { filePath: path.join(examplesDir, urlPath.replace('/examples/', '')) }
  }

  if (urlPath.startsWith('/dist/')) {
    return { filePath: path.join(editorDistDir, urlPath.replace('/dist/', '')) }
  }

  return { notFound: true }
}

function isSafePath(baseDir, filePath) {
  const relativePath = path.relative(baseDir, filePath)
  return relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`)
  const { filePath, notFound, redirect } = resolvePath(requestUrl.pathname)

  if (redirect) {
    res.writeHead(302, { Location: redirect })
    res.end()
    return
  }

  if (notFound || !filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not Found')
    return
  }

  const baseDir = requestUrl.pathname.startsWith('/dist/') ? editorDistDir : examplesDir
  if (!isSafePath(baseDir, filePath) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not Found')
    return
  }

  sendFile(filePath, res)
})

server.listen(port, '127.0.0.1', () => {
  console.log(`HTML demo server listening on http://127.0.0.1:${port}/examples/`)
})
