import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import qiankun from 'vite-plugin-qiankun';

const isQiankun = process.env.QIANKUN === 'true'; // Use an environment variable to differentiate modes
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: isQiankun ? './' : '/', // Set base path dynamically for qiankun compatibility
  plugins: [
    react({
    }),
    qiankun('app1', { useDevMode: !isProduction }), // Plugin Qiankun, si utilisé
  ],
  server: {
      host: '0.0.0.0', // Allow access from Docker
      port: 5157,
      cors: {
        origin: "http://38.242.208.242:3000",
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true, // Allow cookies to be sent with requests (if needed)
      },
      hmr: false,
  },
  build: {
    target: 'esnext', // Ensure compatibility with modern browsers for qiankun
    modulePreload: true,
    cssCodeSplit: true, // Enable CSS splitting for modular builds
    rollupOptions: {
      output: {
        format: 'es', // Use SystemJS for Qiankun integration
        entryFileNames: '[name].js', // Output JavaScript files with `.js` extensions
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
      external: isQiankun
        ? ['react', 'react-dom'] // Treat React and ReactDOM as external to avoid duplication in host and microfrontend
        : [],
    },
    outDir: 'dist', // Output directory for the build files
    sourcemap: true, // Generate source maps for debugging (optional)
    
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // Alias for cleaner imports
    },
  },
  optimizeDeps: {
    exclude: isQiankun ? ['react', 'react-dom'] : [], // Exclude dependencies to prevent duplication in Qiankun
  },
});
