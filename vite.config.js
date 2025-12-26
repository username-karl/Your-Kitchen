import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        server: {
            port: 3001,
            host: '0.0.0.0',
        },
        plugins: [
            react(),
            // VitePWA({
            //     registerType: 'autoUpdate',
            //     devOptions: {
            //         enabled: true
            //     },
            //     includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
            //     manifest: {
            //         name: 'ChefAI: Culinary Mentor',
            //         short_name: 'ChefAI',
            //         description: 'Your personal AI chef and kitchen assistant.',
            //         theme_color: '#fff7ed',
            //         background_color: '#fff7ed',
            //         display: 'standalone',
            //         orientation: 'portrait',
            //         scope: '/',
            //         start_url: '/',
            //         icons: [
            //             {
            //                 src: 'pwa-192x192.png',
            //                 sizes: '192x192',
            //                 type: 'image/png'
            //             },
            //             {
            //                 src: 'pwa-512x512.png',
            //                 sizes: '512x512',
            //                 type: 'image/png'
            //             },
            //             {
            //                 src: 'pwa-512x512.png',
            //                 sizes: '512x512',
            //                 type: 'image/png',
            //                 purpose: 'any maskable'
            //             }
            //         ]
            //     }
            // })
        ],
        define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
            'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            }
        }
    };
});
