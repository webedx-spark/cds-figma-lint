import { defineConfig } from 'vite';

import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src/plugin'),

  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/plugin/controller.ts'),
      name: 'CDS Style Lint',
      // the proper extensions will be added
      fileName: 'controller',
    },

    rollupOptions: {
      output: {
        dir: resolve(__dirname, 'dist/plugin'),
      },
    },
  },
});
