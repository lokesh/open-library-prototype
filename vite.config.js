import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Automatically find all HTML files in the root directory
const htmlFiles = readdirSync(__dirname)
  .filter((file) => file.endsWith('.html'))
  .reduce((entries, file) => {
    const name = file.replace('.html', '');
    entries[name] = resolve(__dirname, file);
    return entries;
  }, {});

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/open-library-prototype/',
  build: {
    rollupOptions: {
      input: htmlFiles,
    },
  },
}));

