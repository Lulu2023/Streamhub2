// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react", "shaka-player"]
  },
  server: {
    proxy: {
      "/api/login": {
        target: "https://login.rtbf.be",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/login/, "/accounts.login"),
        secure: false
      },
      "/api/getjwt": {
        target: "https://login.rtbf.be",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/getjwt/, "/accounts.getJWT"),
        secure: false
      },
      "/api/auth-service": {
        target: "https://auth-service.rtbf.be",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth-service/, ""),
        secure: false
      },
      "/api/redbee": {
        target: "https://exposure.api.redbee.live",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/redbee/, "/v2/customer/RTBF/businessunit/Auvio"),
        secure: false
      },
      "/api/auvio": {
        target: "https://bff-service.rtbf.be",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auvio/, "/auvio/v1.23"),
        secure: false
      },
      "/api/partner": {
        target: "https://www.rtbf.be",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/partner/, "/api/partner"),
        secure: false
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0JywgJ3NoYWthLXBsYXllciddLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBwcm94eToge1xuICAgICAgJy9hcGkvbG9naW4nOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vbG9naW4ucnRiZi5iZScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL2xvZ2luLywgJy9hY2NvdW50cy5sb2dpbicpLFxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgICcvYXBpL2dldGp3dCc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9sb2dpbi5ydGJmLmJlJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvZ2V0and0LywgJy9hY2NvdW50cy5nZXRKV1QnKSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICAnL2FwaS9hdXRoLXNlcnZpY2UnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vYXV0aC1zZXJ2aWNlLnJ0YmYuYmUnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9hdXRoLXNlcnZpY2UvLCAnJyksXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgJy9hcGkvcmVkYmVlJzoge1xuICAgICAgICB0YXJnZXQ6ICdodHRwczovL2V4cG9zdXJlLmFwaS5yZWRiZWUubGl2ZScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL3JlZGJlZS8sICcvdjIvY3VzdG9tZXIvUlRCRi9idXNpbmVzc3VuaXQvQXV2aW8nKSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICAnL2FwaS9hdXZpbyc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9iZmYtc2VydmljZS5ydGJmLmJlJyxcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpXFwvYXV2aW8vLCAnL2F1dmlvL3YxLjIzJyksXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgJy9hcGkvcGFydG5lcic6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly93d3cucnRiZi5iZScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaVxcL3BhcnRuZXIvLCAnL2FwaS9wYXJ0bmVyJyksXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBR2xCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsZ0JBQWdCLGNBQWM7QUFBQSxFQUMxQztBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsY0FBYztBQUFBLFFBQ1osUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLGlCQUFpQixpQkFBaUI7QUFBQSxRQUNsRSxRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0EsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLGtCQUFrQixrQkFBa0I7QUFBQSxRQUNwRSxRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0EscUJBQXFCO0FBQUEsUUFDbkIsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLHdCQUF3QixFQUFFO0FBQUEsUUFDMUQsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBLGVBQWU7QUFBQSxRQUNiLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxrQkFBa0Isc0NBQXNDO0FBQUEsUUFDeEYsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBLGNBQWM7QUFBQSxRQUNaLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxpQkFBaUIsY0FBYztBQUFBLFFBQy9ELFFBQVE7QUFBQSxNQUNWO0FBQUEsTUFDQSxnQkFBZ0I7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxtQkFBbUIsY0FBYztBQUFBLFFBQ2pFLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
