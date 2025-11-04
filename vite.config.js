import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        signup: resolve(__dirname, 'signup.html'),
        addBook: resolve(__dirname, 'add-book.html'),
        trending: resolve(__dirname, 'trending.html'),
      },
    },
  },
});

