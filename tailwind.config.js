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
          light: "#9885F0",
          base: "#8257E5",
          dark: "#633BBC"
        },
        lightBtnBg: {
          light: "#F5F5F5",
          base: "#E0E0E0",
          dark: "#CCCCCC"
        },
        darkBtnBg: {
          light: "#333333",
          base: "#252525",
          dark: "#212121"
        },
        info: {
          light: "#42a5f5",
          base: "#1e88e5",
          dark: "#1565c0",
        },
        success: {
          light: "#9ccc65",
          base: "#7cb342",
          dark: "#558b2f"
        },
        warning: {
          light: "#ffee58",
          base: "#fdd835",
          dark: "#f9a825"
        },
        danger: {
          light: "#ef5350",
          base: "#e53935",
          dark: "#c62828"
        },
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
