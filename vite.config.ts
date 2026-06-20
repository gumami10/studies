import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const LEGACY_FONT_RE = /primeicons\.(eot|ttf|woff|woff2|svg)(\?[^'"\\)\s]*)?/g

function stripLegacyPrimeIcons() {
  return {
    name: 'strip-legacy-primeicons',
    enforce: 'post' as const,
    transform(code: string, id: string) {
      if (id.includes('primeicons.css') && id.includes('node_modules')) {
        return {
          code: code.replace(LEGACY_FONT_RE, (_m, _ext, qs) => `primeicons.woff2${qs || ''}`),
          map: null,
        }
      }
      return null
    },
    generateBundle(_options: unknown, bundle: Record<string, { type: string }>) {
      for (const fileName of Object.keys(bundle)) {
        if (/primeicons-.*\.(eot|ttf|woff|svg)$/.test(fileName)) {
          delete bundle[fileName]
        }
      }
    },
  }
}

export default defineConfig({
  base: '/studies/',
  plugins: [vue(), stripLegacyPrimeIcons()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('/primevue/') ||
              id.includes('/@primeuix/') ||
              id.includes('/primeicons/')
            ) {
              return 'primevue-vendor'
            }
            if (id.includes('/fuse.js/')) {
              return 'fuse-vendor'
            }
            if (
              id.includes('/vue/') ||
              id.includes('/vue-router/') ||
              id.includes('/pinia/') ||
              id.includes('/@vue/')
            ) {
              return 'vue-vendor'
            }
          }
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,ts}', 'scripts/**/*.{test,spec}.{js,mjs}'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}', 'scripts/**/*.mjs'],
      exclude: ['src/main.ts', 'data/**'],
    },
  },
})
