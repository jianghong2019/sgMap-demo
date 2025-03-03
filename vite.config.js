import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import UnoCSS from 'unocss/vite'
import AutoExport from 'unplugin-auto-export/vite';
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // 加载环境变量
  return {
    base: env.VITE_BASE_URL || '/', // 从环境变量中读取
    plugins: [
      // VueRouter({
      // }),
      vue(),
      vueDevTools(),
      UnoCSS(),
      AutoExport({
        path: ['src/composables/*'],
        ignore: ['**/node_modules/*'],
        formatter: (filename, extname) => `export * from './${filename}'`
      }),
      AutoImport({
        resolvers: [],
        imports: [
          'vue',
          'vue-router'
        ],
        dirs: [
          './src/composables',
        ],
        dts: './auto-imports.d.ts',
      }),
      Components({
        resolvers: [],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }

})

