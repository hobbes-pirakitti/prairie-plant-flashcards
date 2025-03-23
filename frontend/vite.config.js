import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default {
    server: {
        port: 443,
        https: true,
        strictPort: true,
        allowedHosts: true,
        host: true
    },
    plugins: [ mkcert() ]
}