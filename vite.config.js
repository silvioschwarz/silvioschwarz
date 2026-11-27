//import react from '@vitejs/plugin-react'
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(() =>({
  base: "/",
  plugins: [reactRouter(), tailwindcss()],
  build: {
    // Erhöht das Warnlimit (optional, Standard ist 500 kB)
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'pdf-vendor',
              test: /node_modules[\\/](jspdf|html-to-image|html2canvas)/,
              priority: 20,
            },
            {
              name: 'vendor',
              test: /node_modules/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
}))
