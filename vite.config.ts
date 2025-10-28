import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  server: {
    port: 5173, // port du front
    proxy: {
      '/api': 'http://localhost:3000', // ton backend Express
    },
  },
  build: {
    outDir: 'dist',
  },
})
