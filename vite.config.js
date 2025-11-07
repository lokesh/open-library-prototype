import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/open-library-prototype/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        signup: resolve(__dirname, 'signup.html'),
        trending: resolve(__dirname, 'trending.html'),
        forms: resolve(__dirname, 'forms.html'),
        components: resolve(__dirname, 'components.html'),
        buttonGroupDemo: resolve(__dirname, 'button-group-demo.html'),
      },
    },
  },
}));

