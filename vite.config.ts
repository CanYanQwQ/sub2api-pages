import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Static build, deployed to Vercel and embedded as an iframe by Sub2API.
// `base: '/'` keeps asset URLs root-absolute, which is required because the
// embedding URL may carry query parameters (?api=, ?theme=, ?lang=).
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2020',
  },
})
