import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"
// import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
  plugins: [
    react(),
    // tailwindcss()
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        sidepanel: resolve(__dirname, "src/sidepanel/index.html"),
      },
    },
    outDir: "dist",
  },
})

export default config
