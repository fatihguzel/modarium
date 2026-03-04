import { build } from 'esbuild'
import { mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, 'dist')
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true })

await build({
  entryPoints: [join(__dirname, 'src', 'index.js')],
  bundle: true,
  format: 'esm',
  outfile: join(distDir, 'index.mjs'),
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  platform: 'browser',
  jsx: 'automatic',
})

await build({
  entryPoints: [join(__dirname, 'src', 'index.js')],
  bundle: true,
  format: 'cjs',
  outfile: join(distDir, 'index.js'),
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  platform: 'browser',
  jsx: 'automatic',
})

console.log('Build tamamlandı.')
