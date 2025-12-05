import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: 'build',
      target: 'es2015', // Compatibilidad con navegadores antiguos
      cssTarget: 'chrome80', // CSS compatible
      minify: 'terser',
      terserOptions: {
        safari10: true // Compatibilidad Safari 10+
      }
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
      target: 'es2015'
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [
      react({
        jsxRuntime: 'automatic',
        fastRefresh: true
      }),
      tailwindcss()
    ],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
    port: 3000
  }
  }
})