import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.tsx',
            ],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                    optimizedFallbacks: false,
                }),
            ],
        }),
        react(),
        tailwindcss(),
    ],

    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,

        cors: {
            origin: [
                'http://192.168.1.7:8001',
                'http://localhost:8001',
            ],
        },

        hmr: {
            host: '192.168.1.7',
            protocol: 'ws',
            port: 5173,
        },

        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});