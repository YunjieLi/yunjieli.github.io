import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const legacyDirs = [
  'toc', 'kings', 'swordsmen', 'lily', 'quip-insights',
  'deck-tests', 'tuner', 'vanilla-english', 'chinese-names',
  'press-here', 'mapbox', 'static',
]

export default defineConfig({
  plugins: [
    react(),
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
