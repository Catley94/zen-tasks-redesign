import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In dev, forward /api calls to the Express backend (npm run dev:server).
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
