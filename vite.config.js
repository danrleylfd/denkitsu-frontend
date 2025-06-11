import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
// import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
  plugins: [
    react(),
    // tailwindcss()
  ]
})

export default config
