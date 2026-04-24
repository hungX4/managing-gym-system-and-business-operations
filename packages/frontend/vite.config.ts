import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite' // <-- Thêm dòng này

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      tsDecorators: true
    }),
    tailwindcss(), // <-- Thêm dòng này
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3636',
    },
  }
})