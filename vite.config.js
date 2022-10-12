import { resolve } from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src/app'),
  publicDir: resolve(__dirname, 'src/app/assets'),
  build: {
    outDir: resolve(__dirname, 'dist/app'),
    emptyOutDir: true,
  },
  plugins: [svgr(), react(), viteSingleFile()],
});
