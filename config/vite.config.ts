import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const configDir = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = path.resolve(configDir, '..')

export default defineConfig({
  plugins: [react()],
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
