import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// Root-level legacy HTML dirs still at project root
const legacyDirs = [
  'toc', 'lily', 'quip-insights',
  'tuner', 'vanilla-english', 'chinese-names',
  'mapbox', 'static', 'studio', 'turbines',
  'dinosaur-game', 'wack-a-virus',
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
        // Games — assets that now live inside src/
        { src: 'src/games/flip/*.jpg', dest: 'src/games/flip' },
        { src: 'src/games/press-here', dest: 'src/games' },
        // Maps — full directories now living inside src/
        { src: 'src/maps/kings',      dest: 'src/maps' },
        { src: 'src/maps/swordsmen',  dest: 'src/maps' },
        { src: 'src/maps/deck-tests', dest: 'src/maps' },
        { src: 'src/maps/liancheng',  dest: 'src/maps' },
        { src: 'upstream_land_logo.svg', dest: '.' },
        { src: 'favicon.ico', dest: '.' },
        { src: 'CNAME', dest: '.' },
      ],
    }),
  ],
  base: '/',
})
