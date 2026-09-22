import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración mínima Vite + React (Sección A del stack).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    outDir: "dist",
  },
});
