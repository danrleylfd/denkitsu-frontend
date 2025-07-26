import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Menu, X, Sun, Moon, Home, Newspaper, Cloud, Languages, Clock, Code, Bot, Kanban, Link2,
  PersonStanding, LogIn, UserPlus, Lock, KeyRound, LogOut,
  Upload, Video, TrendingUp, Play, Edit2, Clapperboard,
} from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { useBackground } from "../contexts/BackgroundContext"

const MainContent = ({ children }) => (
  <main className="flex flex-col items-center p-2 gap-2 mx-auto min-h-dvh w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

const IconGroup = ({ items, title, isOpen }) => {
  const iconClass = [
    "flex items-center justify-center h-6 rounded-xl",
    "bg-transparent hover:bg-lightBg-primary dark:hover:bg-darkBg-primary",
    "text-lightFg-primary dark:text-darkFg-primary hover:text-primary-light dark:hover:text-primary-light active:text-primary-dark dark:active:text-primary-dark",
    "cursor-pointer transition-all duration-200",
    isOpen && "w-8 py-4",
    !isOpen && "p-4",
  ].join(" ")

  if (!isOpen) {
    return (
      <div className="flex flex-col gap-1 justify-center items-center">
        {items.map(({ icon: Icon, label, to }, index) => (
          <Link key={index} to={to} className={iconClass} title={label}>
            <Icon size={16} />
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4">
      {items.map(({ icon: Icon, label, to }, index) => (
        <Link key={index} to={to} className={iconClass} title={label}>
          <Icon size={16} />
        </Link>
      ))}
    </div>
  )
}

const SideMenu = ({ children, className, fixed, ContentView = MainContent }) => {
  // const { pathname } = useLocation()
  const { background } = useBackground()
  const { theme, toggleTheme } = useTheme()
  const { signed } = useAuth()

  const getInitialMenuState = () => localStorage.getItem("@Denkitsu:menuState") === "opened"
  const [isOpen, setOpen] = useState(getInitialMenuState)
  const toggleMenu = () => setOpen((prev) => !prev)

  useEffect(() => {
    localStorage.setItem("@Denkitsu:menuState", isOpen ? "opened" : "closed")
  }, [isOpen])

  const menuItems = [
    { icon: Clock, label: "Pomodoro", to: "/pomodoro" },
    { icon: Newspaper, label: "Notícias", to: "/news" },
    { icon: Cloud, label: "Clima", to: "/clima" },
    { icon: Languages, label: "Tradutor", to: "/translator" },
    { icon: Link2, label: "Atalho", to: "/atalho" },
    { icon: Clapperboard, label: "Cinema", to: "/cinema" },
  ]

  const aiItems = [
    { icon: Bot, label: "Denkitsu AI", to: "/chat" },
    { icon: Code, label: "Codebase", to: "/codebase" },
    { icon: Edit2, label: "Editor", to: "/editor"},
    { icon: Kanban, label: "Kanban", to: "/kanban" },
  ]

  const videoItems = [
    { icon: Video, label: "Meus Vídeos", to: "/my-videos" },
    { icon: Upload, label: "Upload", to: "/upload" },
    { icon: TrendingUp, label: "Vídeos Populares", to: "/popular" },
    { icon: Play, label: "Vídeos Recentes", to: "/recents" },
  ]

  const authItems = [
    { icon: Bot, label: "Denkitsu AI", to: "/chat" },
    { icon: LogIn, label: "Entrar", to: "/signin" },
    { icon: UserPlus, label: "Cadastrar", to: "/signup" },
    { icon: Lock, label: "Esqueceu a senha?", to: "/forgot_password" },
    { icon: KeyRound, label: "Redefinir senha", to: "/reset_password" },
  ]

  const signedItems = [
    { icon: PersonStanding, label: "Perfil", to: "/profile" },
  ]

  const currentMenuItems = signed ? [...menuItems, ...signedItems] : menuItems

  const menuItemClass = [
    "flex items-center px-4 py-1 mx-1 rounded-xl",
    "bg-transparent hover:bg-lightBg-primary dark:hover:bg-darkBg-primary",
    "text-lightFg-primary dark:text-darkFg-primary hover:text-primary-light dark:hover:text-primary-light active:text-primary-dark dark:active:text-primary-dark",
    "cursor-pointer",
    !isOpen && "justify-center"
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={`flex ${className || ""}`} style={{ backgroundImage: `url('${background}')` }}>
      <aside
        className={`h-screen transition-all duration-300 ease-in-out z-40 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] border-r ${
          isOpen ? "w-48" : "w-14"
        } bg-lightBg-secondary dark:bg-darkBg-secondary border-border h-dvh ${fixed && "fixed"}`}>
        <nav className="flex flex-col gap-1">
          <div className="w-0 h-0 p-0 m-0" />
          <button onClick={toggleMenu} className={menuItemClass} title={!isOpen ? "Menu" : ""}>
            <div className="w-6 h-6 flex items-center justify-center">{isOpen ? <X size={16} /> : <Menu size={16} />}</div>
            {isOpen && <span className="ml-1 select-none">Menu</span>}
          </button>
          <button onClick={toggleTheme} className={menuItemClass} title={!isOpen ? "Alternar Tema" : ""}>
            <div className="w-6 h-6 flex items-center justify-center">{theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}</div>
            {isOpen && <span className="ml-1 select-none">Alternar Tema</span>}
          </button>
          {isOpen && (
            <Link to="/" className={menuItemClass} title="Início">
              <div className="w-6 h-6 flex items-center justify-center">
                <Home size={16} />
              </div>
              <span className="ml-1 select-none">Início</span>
            </Link>
          )}
          {signed && <IconGroup items={aiItems} title="Denkitsu AI" isOpen={isOpen} />}
          {currentMenuItems.map(({ icon: Icon, label, to }, index) => (
            <Link key={index} to={to} className={menuItemClass} title={!isOpen ? label : ""}>
              <div className="w-6 h-6 flex items-center justify-center">
                <Icon size={16} />
              </div>
              {isOpen && <span className="ml-1 select-none">{label}</span>}
            </Link>
          ))}
          {signed && <IconGroup items={videoItems} title="Vídeos" isOpen={isOpen} />}
          {!signed && <IconGroup items={authItems} title="Autenticação" isOpen={isOpen} />}
        </nav>
      </aside>
      <ContentView>{children}</ContentView>
    </div>
  )
}

export default SideMenu
