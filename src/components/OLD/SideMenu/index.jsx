import { useEffect, useState } from "react"
import { LuMenu, LuX, LuCloud, LuNewspaper, LuBotMessageSquare, LuLogIn, LuLogOut, LuLock, LuClock, LuList, LuPlay, LuUpload, LuLink, LuPersonStanding, LuSun, LuMoon } from "react-icons/lu"
import { MdHomeFilled } from "react-icons/md"
import { useTheme } from "../../contexts/ThemeContext"
import { useAuth } from "../../contexts/AuthContext"

import { Container, Sidebar, Nav, ToggleButton, IconWrapper, Label, MenuItem, MainContent } from "./styles"

const SideMenu = ({children, className, style, ContentView = MainContent}) => {
  const { theme, toggleTheme } = useTheme()
  const { signed } = useAuth()

  const getInitialMenuState = () => {
    const storedState = localStorage.getItem("@Denkitsu:menuState")
    return storedState === "opened"
  }
  const [isOpen, setOpen] = useState(getInitialMenuState)
  const toggleMenu = () => setOpen(isOpen => !isOpen)
  useEffect(() => {
    localStorage.setItem("@Denkitsu:menuState", isOpen ? "opened" : "closed")
  }, [isOpen])

  const menuItems = [
    { icon: MdHomeFilled, label: "Início", to: "/" },
    { icon: LuNewspaper, label: "Notícias", to: "/news" },
    { icon: LuCloud, label: "Clima", to: "/clima" },
    { icon: LuClock, label: "Pomodoro", to: "/pomodoro" },
    { icon: LuList, label: "Missões", to: "/todo"},
  ]
  signed && menuItems.push(
    { icon: LuBotMessageSquare, label: "AI", to: "/chat" },
    { icon: LuLink, label: "Atalho", to: "/atalho" },
    { icon: LuPlay, label: "Meus Vídeos", to: "/my-videos" },
    { icon: LuUpload, label: "Upload", to: "/upload" },
    { icon: LuPlay, label: "Vídeos Populares", to: "/popular" },
    { icon: LuPlay, label: "Vídeos Recentes", to: "/recents" },
    { icon: LuPersonStanding, label: "Perfil", to: "/profile" },
    { icon: LuLogOut, label: "Sair", to: "/auth/signout" },
  )
  !signed && menuItems.push(
    { icon: LuLogIn, label: "Entrar", to: "/signin" },
    { icon: LuLogIn, label: "Cadastrar", to: "/signup"},
    { icon: LuLock, label: "Esqueceu a senha?", to: "/forgot_password" },
    { icon: LuLock, label: "Redefinir senha", to: "/reset_password" },
  )
  return (
    <Container className={className}>
      <Sidebar isOpen={isOpen} style={style}>
        <Nav>
          <ToggleButton onClick={toggleMenu}>
            <IconWrapper>
              {isOpen ? <LuX size={16} /> : <LuMenu size={16} />}
            </IconWrapper>
            {isOpen && <Label>Menu</Label>}
          </ToggleButton>
          <ToggleButton onClick={toggleTheme}>
            <IconWrapper>
              {theme === "dark" ? <LuSun size={16} /> : <LuMoon size={16} />}
            </IconWrapper>
            {isOpen && <Label>Tema</Label>}
          </ToggleButton>
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <MenuItem key={index} to={item.to}>
                <IconWrapper>
                  <Icon size={16} />
                </IconWrapper>
                {isOpen && <Label>{item.label}</Label>}
              </MenuItem>
            )
          })}
        </Nav>
      </Sidebar>
      <ContentView>
        {children}
      </ContentView>
    </Container>
  )
}

export default SideMenu
