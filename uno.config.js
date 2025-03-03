import { defineConfig, presetAttributify, presetUno, presetIcons } from 'unocss'
export default defineConfig({
    presets: [
        presetUno(),
        presetAttributify({ /* preset options */ }),
        presetIcons()
    ],
    rules: [

    ],
})