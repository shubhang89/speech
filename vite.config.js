import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // allows access from any device on your local network
    port: 5173,        // or any port you prefer
  base: "./", // IMPORTANT for Vercel deployment
  },
})

