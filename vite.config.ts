import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  assetsInclude: ['**/*.onnx'],
  optimizeDeps: {
    exclude: ['@huggingface/transformers'],
  },
  worker: {
    format: 'es',
  },
})
