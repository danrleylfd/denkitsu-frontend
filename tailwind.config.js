export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "spin-fast": "spin .3s linear infinite"
      },
      screens: {
        xs: "480px"
      },
      colors: {
        "brand-purple": "#7159C1",
        primary: {
          base: "#8257E5",
          light: "#9885F0",
          dark: "#633BBC"
        },
        success: {
          base: "#1B873F",
          light: "#04D361",
          dark: "#051B0D"
        },
        warning: {
          base: "#EB8A1D",
          light: "#FBA94C",
          dark: "#2E1B06"
        },
        danger: {
          base: "#CC2937",
          light: "#F75A68",
          dark: "#2D090C"
        },
        light: {
          background: "#ffffff",
          cardBg: "#ececec",
          inputBg: "#f7f7f7",
          color: "#0d0d0d",
          textPrimary: "#22223b",
          textSecondary: "#4a4e69",
          textMuted: "#9a8c98",
          btnBg: {
            base: "#E0E0E0",
            light: "#F5F5F5",
            dark: "#CCCCCC"
          },
          border: "#E0E0E0"
        },
        dark: {
          background: "#151515",
          cardBg: "#303030",
          inputBg: "#252525",
          color: "#ffffff",
          textPrimary: "#f8f8f2",
          textSecondary: "#bfc6d1",
          textMuted: "#6c757d",
          btnBg: {
            base: "#252525",
            light: "#333333",
            dark: "#212121"
          },
          border: "#252525"
        },
      },
    },
  },
  plugins: [],
}
