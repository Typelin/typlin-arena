import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// 僅 dev 用：讓 /works/<name>/ 目錄 URL 直接吃到 public/works 下的 index.html，
// 行為對齊 production 靜態託管（vite preview / Pages），免得 dev 的 SPA fallback 蓋掉子頁。
function worksIndex(): Plugin {
  return {
    name: 'works-index',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const m = (req.url || '').split('?')[0].match(/^\/works\/([^/]+)\/?$/)
        if (m) {
          const file = join(server.config.publicDir, 'works', m[1], 'index.html')
          if (existsSync(file)) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(readFileSync(file))
            return
          }
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), worksIndex()],
})
