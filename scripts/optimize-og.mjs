#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SOURCE = resolve(ROOT, 'assets/robot.png')
const OUT_DIR = resolve(ROOT, 'public/og')
const ALT_SOURCE = resolve(ROOT, 'public/robot.png')

const VARIANTS = [
  { name: 'robot-1200x630.webp', width: 1200, height: 630, fit: 'cover', format: 'webp' },
  {
    name: 'robot-1200x630.jpg',
    width: 1200,
    height: 630,
    fit: 'cover',
    format: 'jpeg',
    quality: 82,
  },
  { name: 'robot-square.webp', width: 1200, height: 1200, fit: 'cover', format: 'webp' },
  {
    name: 'robot-square.jpg',
    width: 1200,
    height: 1200,
    fit: 'cover',
    format: 'jpeg',
    quality: 82,
  },
  { name: 'favicon-32.png', width: 32, height: 32, fit: 'cover', format: 'png' },
  { name: 'favicon-32.webp', width: 32, height: 32, fit: 'cover', format: 'webp' },
  { name: 'favicon-180.png', width: 180, height: 180, fit: 'cover', format: 'png' },
]

async function build() {
  let source = SOURCE
  if (!existsSync(source) && existsSync(ALT_SOURCE)) {
    source = ALT_SOURCE
  }
  if (!existsSync(source)) {
    throw new Error(`Source image not found. Expected ${SOURCE} or ${ALT_SOURCE}`)
  }
  mkdirSync(OUT_DIR, { recursive: true })
  const buf = readFileSync(source)
  for (const v of VARIANTS) {
    let pipe = sharp(buf).resize({ width: v.width, height: v.height, fit: v.fit })
    switch (v.format) {
      case 'webp':
        pipe = pipe.webp({ quality: 82 })
        break
      case 'jpeg':
        pipe = pipe.jpeg({ quality: v.quality ?? 82, mozjpeg: true })
        break
      case 'png':
        pipe = pipe.png({ compressionLevel: 9 })
        break
    }
    const out = await pipe.toBuffer()
    const outPath = resolve(OUT_DIR, v.name)
    writeFileSync(outPath, out)
    console.log(`[optimize-og] ${v.name} ${(out.length / 1024).toFixed(1)} KB`)
  }
}

build().catch((err) => {
  console.error('[optimize-og] failed:', err.message)
  process.exit(1)
})
