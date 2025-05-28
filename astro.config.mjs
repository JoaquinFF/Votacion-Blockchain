// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  vite: {
    optimizeDeps: {
      include: ['socket.io-client']
    },
    ssr: {
      noExternal: ['socket.io-client']
    },
    build: {
      rollupOptions: {
        external: ['ethers']
      }
    }
  }
});
