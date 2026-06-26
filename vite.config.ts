import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import qiankun from 'vite-plugin-qiankun';
import * as cheerio from 'cheerio';
import { stripHostManagedTrackingScripts } from '../shared/tracking/stripTrackingFromMicrofrontendHtml';

// Plugin to remove React Refresh preamble
const removeReactRefreshScript = () => {
  return {
    name: 'remove-react-refresh',
    transformIndexHtml(html: any) {
      const $ = cheerio.load(html);
      $('script[src="/@react-refresh"]').remove();
      stripHostManagedTrackingScripts($);
      return $.html();
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: 'https://harx25register.netlify.app/',
    plugins: [
      react({
        jsxRuntime: 'classic',
      }),
      qiankun('auth', {
        useDevMode: true,
      }),
      removeReactRefreshScript(), // Add the script removal plugin
    ],

    define: {
      'import.meta.env': env,
    },
    server: {
      port: 5157,
      strictPort: true,
      cors: true,
      hmr: false,
      fs: {
        allow: [path.resolve(__dirname, '..')],
      },
    },
    build: {
      target: 'esnext',
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          format: 'umd',
          name: 'auth',
          entryFileNames: 'index.js', // Fixed name for the JS entry file
          chunkFileNames: 'chunk-[name].js', // Fixed name for chunks
          assetFileNames: (assetInfo) => {
            // Ensure CSS files are consistently named
            if (assetInfo.name.endsWith('.css')) {
              return 'index.css';
            }
            return '[name].[ext]'; // Default for other asset types
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@harx/shared': path.resolve(__dirname, '../shared'),
      },
    },
  };
 });
