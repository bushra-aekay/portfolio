// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // The vite cli used -swc
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // This maps the '@/' alias to the project root directory
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})