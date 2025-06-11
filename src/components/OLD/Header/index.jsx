import { useState, useEffect } from "react"
import { MdToggleOn, MdToggleOff } from "react-icons/md"
import { LuSun, LuMoon } from "react-icons/lu"

import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"

import { HeaderStyled, HeaderTitle, HeaderLink } from "./styles"
import Button from "../Button"

const Header = ({ title, nav, children, ...rest }) => {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1075)
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth > 1075)
  useEffect(() => {
    const handleMenuVisibility = () => {
      window.innerWidth > 1075 && setIsMenuOpen(true)
      setIsMobileView(window.innerWidth <= 1075)
    }
    handleMenuVisibility()
    window.addEventListener("resize", handleMenuVisibility)
  }, [])
  return (
    <HeaderStyled>
      <HeaderTitle>Denkitsu | {title}</HeaderTitle>
      {isMobileView && (isMenuOpen ? <MdToggleOn size={32} onClick={() => setIsMenuOpen(!isMenuOpen)} /> : <MdToggleOff size={32} onClick={() => setIsMenuOpen(!isMenuOpen)} />)}
      <nav style={{ display: isMenuOpen ? "flex" : "none" }}>
        {nav.map((route, index) => (
          <HeaderLink key={index} to={route.link}>
            {route.label}
          </HeaderLink>
        ))}
        <Button variant={theme === "dark" ? "outline" : "warning"} size="icon" $rounded onClick={toggleTheme}>
          {theme === "dark" ? <LuMoon size={16} /> : <LuSun size={16} />}
        </Button>
        {user && (
          <Button type="submit" variant="danger" $rounded onClick={signOut}>
            Sair
          </Button>
        )}
        {children}
      </nav>
    </HeaderStyled>
  )
}

export default Header
