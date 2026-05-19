import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import type { Plugin } from 'vite'

const configDir = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = path.resolve(configDir, '..')
const bonfiresPath = path.join(projectRoot, 'src', 'data', 'bonfires.json')

// Dev-only plugin: POST /api/save-position  { id, position: [x,y,z] }
// Updates only world_position on the matching bonfire record in bonfires.json.
function savePositionPlugin(): Plugin {
  return {
    name: 'save-position',
    configureServer(server) {
      server.middlewares.use('/api/save-position', async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405)
          res.end()
          return
        }
        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk.toString() })
        req.on('end', () => {
          try {
            const { id, position } = JSON.parse(body) as {
              id: string
              position: [number, number, number]
            }
            const bonfires = JSON.parse(fs.readFileSync(bonfiresPath, 'utf-8')) as Array<{
              id: string
              world_position: [number, number, number]
              [key: string]: unknown
            }>
            const idx = bonfires.findIndex(b => b.id === id)
            if (idx === -1) {
              res.writeHead(404, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: `bonfire id not found: ${id}` }))
              return
            }
            bonfires[idx].world_position = position
            fs.writeFileSync(bonfiresPath, JSON.stringify(bonfires, null, 2), 'utf-8')
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true, id, position }))
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: String(e) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), savePositionPlugin()],
  root: projectRoot,
  publicDir: path.join(projectRoot, 'public'),
  server: {
    fs: { allow: [projectRoot] }
  },
  assetsInclude: ['**/*.gltf', '**/*.bin'],
  build: {
    outDir: path.join(projectRoot, 'dist'),
    emptyOutDir: true,
  },
})
