/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
          manifest: {
            id: '/',
            name: 'Intute - المعلم الذكي للأندرويد',
            short_name: 'Intute',
            description: 'تطبيق أندرويد حقيقي كامل للتعليم والمحادثة الذكية التفاعلية بالصوت والرسومات والملاحظات.',
            theme_color: '#4285F4',
            background_color: '#1a1a2e',
            display: 'standalone',
            display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
            orientation: 'portrait-primary',
            start_url: '/',
            scope: '/',
            lang: 'ar',
            dir: 'rtl',
            categories: ['education', 'productivity', 'utilities'],
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
              },
              {
                src: '/pwa-maskable-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
              },
            ],
            shortcuts: [
              {
                name: 'تحدث مع المعلم',
                short_name: 'المعلم',
                description: 'بدء جلسة تعليمية تفاعلية بالصوت',
                url: '/?source=shortcut_talk',
                icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
              },
              {
                name: 'المعلم العربي كريم',
                short_name: 'كريم العربي',
                description: 'جلسة تعليمية باللغة العربية مع الأستاذ كريم',
                url: '/?agent=karim',
                icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
              },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365,
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
            ],
          },
          devOptions: {
            enabled: true,
            type: 'module',
          },
        }),
      ],
      
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

