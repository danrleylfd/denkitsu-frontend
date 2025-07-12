import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Menu,
  Home,
  X,
  Cloud,
  Newspaper,
  BotMessageSquare,
  LogIn,
  LogOut,
  Lock,
  Clock,
  Kanban,
  Play,
  Upload,
  Link2,
  PersonStanding,
  Sun,
  Moon,
  Languages,
  Code
} from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { useBackground } from "../contexts/BackgroundContext"

const MainContent = ({ children }) => (
  <main
    className="flex flex-col items-center p-2 gap-2 mx-auto min-h-screen w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

const SideMenu = ({ children, className, fixed, ContentView = MainContent }) => {
  const { bgUrl } = useBackground()
  const { theme, toggleTheme } = useTheme()
  const { signed } = useAuth()

  const getInitialMenuState = () => localStorage.getItem("@Denkitsu:menuState") === "opened"
  const [isOpen, setOpen] = useState(getInitialMenuState)
  const toggleMenu = () => setOpen((prev) => !prev)

  useEffect(() => {
    localStorage.setItem("@Denkitsu:menuState", isOpen ? "opened" : "closed")
  }, [isOpen])

  const menuItems = [
    // { icon: Home, label: "Início", to: "/" },
    { icon: Newspaper, label: "Notícias", to: "/news" },
    { icon: Cloud, label: "Clima", to: "/clima" },
    { icon: Clock, label: "Pomodoro", to: "/pomodoro" },
    { icon: Languages, label: "Tradutor", to: "/translator" },
    { icon: Code, label: "Codebase", to: "/codebase" }
  ]

  signed &&
    menuItems.push(
      { icon: Kanban, label: "Kanban", to: "/kanban" },
      { icon: BotMessageSquare, label: "AI", to: "/chat" },
      { icon: Link2, label: "Atalho", to: "/atalho" },
      { icon: Play, label: "Meus Vídeos", to: "/my-videos" },
      { icon: Upload, label: "Upload", to: "/upload" },
      { icon: Play, label: "Vídeos Populares", to: "/popular" },
      { icon: Play, label: "Vídeos Recentes", to: "/recents" },
      { icon: PersonStanding, label: "Perfil", to: "/profile" },
      { icon: LogOut, label: "Sair", to: "/auth/signout" }
    )
  !signed &&
    menuItems.push(
      { icon: LogIn, label: "Entrar", to: "/signin" },
      { icon: LogIn, label: "Cadastrar", to: "/signup" },
      { icon: Lock, label: "Esqueceu a senha?", to: "/forgot_password" },
      { icon: Lock, label: "Redefinir senha", to: "/reset_password" }
    )

  const menuItemClass = [
    "flex items-center px-4 py-0 mx-1 rounded-xl",
    "bg-transparent hover:bg-lightBg-primary dark:hover:bg-darkBg-primary",
    "text-lightFg-primary dark:text-darkFg-primary hover:text-primary-light dark:hover:text-primary-light active:text-primary-dark dark:active:text-primary-dark",
    "cursor-pointer",
    !isOpen && "justify-center"
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={`flex ${className || ""}`} style={{ backgroundImage: `url('${bgUrl}')` }}>
      <aside
        className={`h-screen transition-all duration-300 ease-in-out z-40 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] border-r ${
          isOpen ? "w-48" : "w-14"
        } bg-lightBg-secondary dark:bg-darkBg-secondary border-border ${fixed && "fixed"}`}>
        <nav className="flex flex-col gap-1">
          <div className="w-0 h-0 p-0 m-0"></div>
          <button onClick={toggleMenu} className={menuItemClass} title={!isOpen ? "Menu" : ""}>
            <div className="w-6 h-6 flex items-center justify-center">
              {isOpen ? <X size={16} /> : <Menu size={16} />}
            </div>
            {isOpen && (
              <span className="ml-3 select-none">
                Menu
              </span>
            )}
          </button>
          <button onClick={toggleTheme} className={menuItemClass} title={!isOpen ? "Alternar Tema" : ""}>
            <div className="w-6 h-6 flex items-center justify-center">
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            </div>
            {isOpen && (
              <span className="ml-3 select-none">
                Alternar Tema
              </span>
            )}
          </button>
          {menuItems.map(({ icon: Icon, label, to }, index) => (
            <Link key={index} to={to} className={menuItemClass} title={!isOpen ? label : ""}>
              <div className="w-6 h-6 flex items-center justify-center">
                <Icon size={16} />
              </div>
              {isOpen && (
                <span className="ml-3 select-none">
                  {label}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
      <ContentView>{children}</ContentView>
    </div>
  )
}

export default SideMenu
