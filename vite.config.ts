import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
    port: 3000,
    host: true,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router",
      "@reduxjs/toolkit",
      "react-redux",
      "clsx",
      "tailwind-merge",
      "lucide-react",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
      "firebase/storage",
    ],
  },
  build: {
    target: "esnext",
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/firebase/")) {
            return "vendor-firebase";
          }
          if (id.includes("node_modules/lucide-react/")) {
            return "vendor-lucide";
          }
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router/")
          ) {
            return "vendor-react";
          }
          if (
            id.includes("node_modules/@reduxjs/") ||
            id.includes("node_modules/react-redux/")
          ) {
            return "vendor-redux";
          }
        },
      },
    },
  },
});

