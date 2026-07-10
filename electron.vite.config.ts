import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '~': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src'),
      },
    },
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dirs: [
          resolve('src/renderer/src/composables'),
          resolve('src/renderer/src/stores'),
          resolve('src/renderer/src/utils'),
        ],
        dts: resolve('src/renderer/src/auto-imports.d.ts'),
      }),
      Components({
        dirs: [resolve('src/renderer/src/components')],
        dts: resolve('src/renderer/src/components.d.ts'),
      }),
    ],
  },
})
