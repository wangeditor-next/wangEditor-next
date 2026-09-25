import fs from 'node:fs'
import path from 'node:path'

const distDir = path.resolve(process.cwd(), 'dist')

if (fs.existsSync(distDir)) {
  for (const entry of fs.readdirSync(distDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.css')) {
      continue
    }

    fs.rmSync(path.join(distDir, entry.name))
    const mapPath = path.join(distDir, `${entry.name}.map`)

    if (fs.existsSync(mapPath)) {
      fs.rmSync(mapPath)
    }
  }
}
