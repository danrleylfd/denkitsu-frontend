import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  LuMenu,
  LuX,
  LuCloud,
  LuNewspaper,
  LuBotMessageSquare,
  LuLogIn,
  LuLogOut,
  LuLock,
  LuClock,
  LuKanban,
  LuPlay,
  LuUpload,
  LuLink,
  LuPersonStanding,
  LuSun,
  LuMoon
} from "react-icons/lu"
import { MdHomeFilled } from "react-icons/md"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"

const MainContent = ({ children }) => (
  <main
    className="flex flex-col items-center p-2 gap-2 mx-auto min-h-screen w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto"
    data-oid="kf2ekpl">
    {children}
  </main>
)

const SideMenu = ({ children, className, fixed, ContentView = MainContent }) => {
  const { theme, toggleTheme } = useTheme()
  const { signed } = useAuth()

  const getInitialMenuState = () => localStorage.getItem("@Denkitsu:menuState") === "opened"
  const [isOpen, setOpen] = useState(getInitialMenuState)
  const toggleMenu = () => setOpen((prev) => !prev)

  useEffect(() => {
    localStorage.setItem("@Denkitsu:menuState", isOpen ? "opened" : "closed")
  }, [isOpen])

  const menuItems = [
    { icon: MdHomeFilled, label: "Início", to: "/" },
    { icon: LuNewspaper, label: "Notícias", to: "/news" },
    { icon: LuCloud, label: "Clima", to: "/clima" },
    { icon: LuClock, label: "Pomodoro", to: "/pomodoro" }
  ]

  signed &&
    menuItems.push(
      { icon: LuKanban, label: "Kanban", to: "/kanban" },
      { icon: LuBotMessageSquare, label: "AI", to: "/chat" },
      { icon: LuLink, label: "Atalho", to: "/atalho" },
      { icon: LuPlay, label: "Meus Vídeos", to: "/my-videos" },
      { icon: LuUpload, label: "Upload", to: "/upload" },
      { icon: LuPlay, label: "Vídeos Populares", to: "/popular" },
      { icon: LuPlay, label: "Vídeos Recentes", to: "/recents" },
      { icon: LuPersonStanding, label: "Perfil", to: "/profile" },
      { icon: LuLogOut, label: "Sair", to: "/auth/signout" }
    )
  !signed &&
    menuItems.push(
      { icon: LuLogIn, label: "Entrar", to: "/signin" },
      { icon: LuLogIn, label: "Cadastrar", to: "/signup" },
      { icon: LuLock, label: "Esqueceu a senha?", to: "/forgot_password" },
      { icon: LuLock, label: "Redefinir senha", to: "/reset_password" }
    )

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
    <div className={`flex ${className || ""}`} data-oid="ir3wt8z">
      <aside
        className={`h-screen transition-all duration-300 ease-in-out z-40 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] border-r ${
          isOpen ? "w-48" : "w-14"
        } bg-lightBg-secondary dark:bg-darkBg-secondary border-border ${fixed && "fixed"}`}
        data-oid="32lk8.8">
        <nav className="flex flex-col gap-1" data-oid="5sdx753">
          <div className="w-0 h-0 p-0 m-0" data-oid="x022fjc"></div>
          <button onClick={toggleMenu} className={menuItemClass} title={!isOpen ? "Menu" : ""} data-oid="oaibd_m">
            <div className="w-6 h-6 flex items-center justify-center" data-oid="7hw_oz1">
              {isOpen ? <LuX size={16} data-oid="e86or83" /> : <LuMenu size={16} data-oid="_avbjb:" />}
            </div>
            {isOpen && (
              <span className="ml-3 select-none" data-oid=".xt:glt">
                Menu
              </span>
            )}
          </button>
          <button onClick={toggleTheme} className={menuItemClass} title={!isOpen ? "Alternar Tema" : ""} data-oid="5ns.yfu">
            <div className="w-6 h-6 flex items-center justify-center" data-oid="..s-ea4">
              {theme === "dark" ? <LuMoon size={16} data-oid="at.l0ct" /> : <LuSun size={16} data-oid="rk97ni3" />}
            </div>
            {isOpen && (
              <span className="ml-3 select-none" data-oid="vu_gy5s">
                Alternar Tema
              </span>
            )}
          </button>
          {menuItems.map(({ icon: Icon, label, to }, index) => (
            <Link key={index} to={to} className={menuItemClass} title={!isOpen ? label : ""} data-oid="8lkl9s2">
              <div className="w-6 h-6 flex items-center justify-center" data-oid="tk9dqo4">
                <Icon size={16} data-oid="yon-qhk" />
              </div>
              {isOpen && (
                <span className="ml-3 select-none" data-oid="wq4vqrc">
                  {label}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
      <ContentView data-oid="uj3n8hu">{children}</ContentView>
    </div>
  )
}

export default SideMenu
