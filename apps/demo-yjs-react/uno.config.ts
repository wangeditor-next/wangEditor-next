import { defineConfig, presetWind3 } from 'unocss'

export default defineConfig({
  presets: [presetWind3()],
  theme: {
    colors: {
      primary: '#D24075',
      'primary-light': '#F2C6D6',
    },
  },
})
