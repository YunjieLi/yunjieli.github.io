import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// Root-level legacy HTML dirs (not yet moved into src/)
const legacyDirs = [
  'lily', 'quip-insights',
  'tuner', 'vanilla-english', 'chinese-names',
  'static', 'studio', 'turbines',
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
        // Games
        { src: 'src/games/flip/*.jpg',         dest: 'src/games/flip' },
        { src: 'src/games/whack/*.gif',        dest: 'src/games/whack' },
        { src: 'src/games/whack/*.svg',        dest: 'src/games/whack' },
        { src: 'src/games/whack/*.png',        dest: 'src/games/whack' },
        { src: 'src/games/press-here',        dest: 'src/games' },
        { src: 'src/games/dinosaur/game.html',dest: 'src/games/dinosaur' },
        // Maps
        { src: 'src/maps/kings',      dest: 'src/maps' },
        { src: 'src/maps/swordsmen',  dest: 'src/maps' },
        { src: 'src/maps/deck-tests', dest: 'src/maps' },
        { src: 'src/maps/liancheng',  dest: 'src/maps' },
        { src: 'src/maps/mapbox',     dest: 'src/maps' },
        // Pages
        { src: 'src/pages/toc/img',   dest: 'src/pages/toc' },
        { src: 'upstream_land_logo.svg', dest: '.' },
        { src: 'favicon.ico', dest: '.' },
        { src: 'CNAME', dest: '.' },
      ],
    }),
  ],
  base: '/',
  server: {
    host: true,   // bind to 0.0.0.0 — accessible from other devices on the same network
    port: 5174,
    strictPort: true,
  },
})
