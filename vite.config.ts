import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', 'shaka-player'],
  },
  server: {
    proxy: {
      '/api/login': {
        target: 'https://login.rtbf.be',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/login/, '/accounts.login'),
        secure: false,
      },
      '/api/getjwt': {
        target: 'https://login.rtbf.be',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/getjwt/, '/accounts.getJWT'),
        secure: false,
      },
      '/api/auth-service': {
        target: 'https://auth-service.rtbf.be',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth-service/, ''),
        secure: false,
      },
      '/api/redbee': {
        target: 'https://exposure.api.redbee.live',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/redbee/, '/v2/customer/RTBF/businessunit/Auvio'),
        secure: false,
      },
      '/api/auvio': {
        target: 'https://bff-service.rtbf.be',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auvio/, '/auvio/v1.23'),
        secure: false,
      },
      '/api/partner': {
        target: 'https://www.rtbf.be',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/partner/, '/api/partner'),
        secure: false,
      },
    },
  },
});
