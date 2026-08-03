import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/projects/juegos/cyber-pong/',
  plugins: [react()],
  server: {
    allowedHosts: [
      'b11b-190-174-208-145.ngrok-free.app',
      '.ngrok-free.app'
    ]
  }
})
