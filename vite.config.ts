import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), // Version 6.0+ recommended for Vite 8
  ],
  resolve: {
    // Vite 8 natively handles tsconfig paths
    tsconfigPaths: true,
  },
  build: {
    // Rolldown replaces Rollup as the default bundler
    rolldownOptions: {
      output: {
        // TypeScript 6 supports ES2025 targets
        format: "es",
      },
    },
    // TypeScript 6 deprecates ES5 as a target
    target: "es2025",
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/user": "http://0.0.0.0:8000",
      "/post": "http://0.0.0.0:8000",
      "/images": "http://0.0.0.0:8000",
    },
  },
});
