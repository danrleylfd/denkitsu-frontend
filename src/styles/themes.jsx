const baseTheme = {
  primaryBase: "#8257E5",
  primaryLight: "#9885F0",
  primaryDark: "#633BBC",
  successBase: "#1B873F",
  successLight: "#04D361",
  successDark: "#051B0D",
  warningBase: "#EB8A1D",
  warningLight: "#FBA94C",
  warningDark: "#2E1B06",
  dangerBase: "#CC2937",
  dangerLight: "#F75A68",
  dangerDark: "#2D090C",
}

export const lightTheme = {
  background: "#ffffff",
  cardBg: "#ececec",
  color: "#0d0d0d",
  primaryText: "#22223b",
  secondaryText: "#4a4e69",
  textMuted: "#9a8c98",
  btnBgBase: "#E0E0E0",
  btnBgLight: "#F5F5F5",
  btnBgDark: "#CCCCCC",
  btnFgBase: "#ffffff",
  btnFgAlt: "#000000",
  border: "#E0E0E0",
  ...baseTheme
}

export const darkTheme = {
  background: "#151515",
  cardBg: "#303030",
  color: "#ffffff",
  primaryText: "#f8f8f2",
  secondaryText: "#bfc6d1",
  textMuted: "#6c757d",
  btnBgBase: "#252525",
  btnBgLight: "#333333",
  btnBgDark: "#212121",
  btnFgBase: "#E0E0E0",
  btnFgAlt: "#ffffff",
  border: "#252525",
  ...baseTheme
}
