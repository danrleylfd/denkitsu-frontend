export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      height: {
        "dvh": "100dvh",
      },
      minHeight: {
        "dvh": "100dvh",
      },
      animation: {
        "spin-fast": "spin .3s linear infinite",
        "marquee": "marquee linear infinite"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        }
      },
      screens: {
        xs: "480px"
      },
      colors: {
        "brand-purple": "#7159C1",
        bLight: "#E0E0E0",
        bDark: "#252525",
        primary: {
          base: "#8257E5",
          light: "#9885F0",
          dark: "#633BBC"
        },
        violet: { 500: "#8b5cf6" },
        lightBtnBg: {
          base: "#E0E0E0",
          light: "#F5F5F5",
          dark: "#CCCCCC"
        },
        darkBtnBg: {
          base: "#252525",
          light: "#333333",
          dark: "#212121"
        },
        success: {
          base: "#1B873F",
          light: "#04D361",
          dark: "#051B0D"
        },
        lime: { 400: "#a3e635" },
        warning: {
          base: "#EB8A1D",
          light: "#FBA94C",
          dark: "#2E1B06"
        },
        amber: { 500: "#f59e0b" },
        danger: {
          base: "#CC2937",
          light: "#F75A68",
          dark: "#2D090C"
        },
        pink: { 500: "#ec4899" },
        fuchsia: { 500: "#d946ef" },
        blue: { 500: "#3b82f6" },
        cyan: { 400: "#22d3ee" },
        lightBg: {
          primary: "#ffffff",
          secondary: "#ececec",
          tertiary: "#f7f7f7",
        },
        darkBg: {
          primary: "#151515",
          secondary: "#303030",
          tertiary: "#252525",
        },
        lightFg: {
          primary: "#171717",
          secondary: "#525252",
          tertiary: "#a3a3a3",
        },
        darkFg: {
          primary: "#f5f5f5",
          secondary: "#a3a3a3",
          tertiary: "#525252",
        },
      },
    },
  },
  plugins: [],
}
