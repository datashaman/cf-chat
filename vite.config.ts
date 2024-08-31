import path from 'path'
import adapter from '@hono/vite-dev-server/cloudflare'
import pages from '@hono/vite-cloudflare-pages'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
    if (mode === 'client') {
        return {
            build: {
                rollupOptions: {
                    input: ['/app/style.css'],
                    output: {
                        assetFileNames: 'static/assets/[name].[ext]'
                    }
                }
            }
        }
    } else {
        return {
            plugins: [
                honox({
                    devServer: {
                        adapter,
                    },
                }),
                pages(),
            ],
            resolve: {
                alias: {
                    '@': path.resolve(__dirname, 'app'),
                },
            },
        }
    }
})
