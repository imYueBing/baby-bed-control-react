import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // 代理API请求到后端服务器
      '/api': {
        target: 'http://192.168.0.92:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
