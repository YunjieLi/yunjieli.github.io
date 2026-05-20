import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const legacyDirs = [
  'toc', 'kings', 'swordsmen', 'lily', 'quip-insights',
  'deck-tests', 'tuner', 'vanilla-english', 'chinese-names',
  'press-here', 'mapbox', 'static', 'turbines', 'flip-game', 'dinosaur-game',
]

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        ...legacyDirs.map(dir => ({ src: dir, dest: '.' })),
        { src: 'upstream_land_logo.svg', dest: '.' },
        { src: 'favicon.ico', dest: '.' },
        { src: 'CNAME', dest: '.' },
      ],
    }),
  ],
  base: '/',
})
