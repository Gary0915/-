import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', // 只綁定到 localhost，不會顯示 Network 連結
    port: 3000,

    proxy: {
      '/api': {
        target: 'http://solarsystem.local',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'ws://solarsystem.local:81',
        ws: true,
      }
    }
  },
})
