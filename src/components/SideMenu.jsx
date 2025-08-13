import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Menu, X, Sun, Moon, Home, Newspaper, Cloud, Languages, Clock, Code, Bot, Kanban, Link2,
  User, LogIn, UserPlus, LogOut, Film, Edit2, ChevronDown, ChevronRight,
  Upload, Video, TrendingUp, Play, Star, Lock, KeyRound
} from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { useBackground } from "../contexts/BackgroundContext"

const MainContent = ({ children }) => (
  <main className="flex flex-col items-center p-2 gap-2 mx-auto min-h-dvh w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

const SubMenu = ({ isOpen, title, icon: Icon, items, isSubMenuOpen, toggleSubMenu }) => {
  const { pathname } = useLocation()

  const menuItemClass = `
    flex items-center px-4 py-1 rounded-xl w-full
    bg-transparent hover:bg-lightBg-primary dark:hover:bg-darkBg-primary
    text-lightFg-primary dark:text-darkFg-primary hover:text-primary-light dark:hover:text-primary-light
    active:text-primary-dark dark:active:text-primary-dark cursor-pointer
  `

  const activeLinkClass = "bg-primary-base/20 text-primary-base"

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center w-full">
        <Link to={items[0].to} className={`${menuItemClass} justify-center`} title={title}>
          <div className="w-6 h-6 flex items-center justify-center">
            <Icon size={16} />
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      <button onClick={toggleSubMenu} className={`${menuItemClass} justify-between`}>
        <div className="flex items-center">
          <div className="w-6 h-6 flex items-center justify-center">
            <Icon size={16} />
          </div>
          <span className="ml-1 select-none">{title}</span>
        </div>
        {isSubMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {isSubMenuOpen && (
        <div className="flex flex-col pl-5 mt-1 gap-1">
          {items.map(({ icon: ItemIcon, label, to }) => (
            <Link
              key={label}
              to={to}
              title={label}
              className={`${menuItemClass} ${pathname === to ? activeLinkClass : ""}`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <ItemIcon size={16} />
              </div>
              {isOpen && <span className="ml-1 select-none">{label}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const SideMenu = ({ children, className, fixed, ContentView = MainContent }) => {
  const { pathname } = useLocation()
  const { background } = useBackground()
  const { theme, toggleTheme } = useTheme()
  const { signed, signOut } = useAuth()

  const getInitialMenuState = () => localStorage.getItem("@Denkitsu:menuState") === "opened"
  const [isOpen, setOpen] = useState(getInitialMenuState)

  const [openSubMenu, setOpenSubMenu] = useState(() => localStorage.getItem("@Denkitsu:openSubMenu") || null)

  const toggleMenu = () => setOpen((prev) => !prev)

  useEffect(() => {
    localStorage.setItem("@Denkitsu:menuState", isOpen ? "opened" : "closed")
  }, [isOpen])

  useEffect(() => {
    if (openSubMenu) {
      localStorage.setItem("@Denkitsu:openSubMenu", openSubMenu)
    } else {
      localStorage.removeItem("@Denkitsu:openSubMenu")
    }
  }, [openSubMenu])

  const handleSubMenuToggle = (submenuName) => {
    setOpenSubMenu((prev) => (prev === submenuName ? null : submenuName))
  }

  const aiItems = [
    { icon: Bot, label: "Chat", to: "/chat" },
    { icon: Code, label: "Codebase", to: "/codebase" },
    { icon: Edit2, label: "Editor", to: "/editor" },
    { icon: Kanban, label: "Kanban", to: "/kanban" },
  ]

  const toolItems = [
    { icon: Newspaper, label: "Notícias", to: "/news" },
    { icon: Clock, label: "Pomodoro", to: "/pomodoro" },
    { icon: Cloud, label: "Clima", to: "/clima" },
    { icon: Languages, label: "Tradutor", to: "/translator" },
    { icon: Film, label: "Cinema", to: "/cinema" },
  ]

  const videoItems = [
    { icon: Video, label: "Meus Vídeos", to: "/my-videos" },
    { icon: Upload, label: "Upload", to: "/upload" },
    { icon: TrendingUp, label: "Populares", to: "/popular" },
    { icon: Play, label: "Recentes", to: "/recents" },
  ]

  const accountItems = signed
    ? [
      { icon: User, label: "Perfil", to: "/profile" },
      { icon: Link2, label: "Atalho", to: "/atalho" },
    ] : [
      { icon: LogIn, label: "Entrar", to: "/signin" },
      { icon: UserPlus, label: "Cadastrar", to: "/signup" },
      { icon: Lock, label: "Esqueci a senha", to: "/forgot_password" },
      { icon: KeyRound, label: "Redefinir senha", to: "/reset_password" }
    ]

  const menuItemClass = `
    flex items-center px-4 py-1 rounded-xl w-full
    bg-transparent hover:bg-lightBg-primary dark:hover:bg-darkBg-primary
    text-lightFg-primary dark:text-darkFg-primary hover:text-primary-light dark:hover:text-primary-light
    active:text-primary-dark dark:active:text-primary-dark
    cursor-pointer transition-colors duration-200
  `

  const activeLinkClass = "bg-primary-base/20 text-primary-base"

  return (
    <div className={`flex ${className || ""}`} style={{ backgroundImage: `url('${background}')` }}>
      <aside
        className={`transition-all duration-300 ease-in-out z-40 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] border-r ${isOpen ? "w-60" : "w-14"
          } bg-lightBg-secondary dark:bg-darkBg-secondary border-bLight dark:border-bDark h-dvh ${fixed && "fixed"}`}
      >
        <nav className="flex flex-col gap-1 h-full px-1">
          <div className="w-0 h-0 p-0 m-0" />
          <button onClick={toggleMenu} className={`${menuItemClass} ${!isOpen && "justify-center"}`} title={isOpen ? "Fechar Menu" : "Abrir Menu"}>
            <div className="w-6 h-6 flex items-center justify-center">{isOpen ? <X size={16} /> : <Menu size={16} />}</div>
            {isOpen && <span className="ml-1 select-none">Menu</span>}
          </button>
          <Link to="/" className={`${menuItemClass} ${pathname === "/" ? activeLinkClass : ""} ${!isOpen && "justify-center"}`} title={isOpen ? "" : "Início"}>
            <div className="w-6 h-6 flex items-center justify-center"><Home size={16} /></div>
            {isOpen && <span className="ml-1 select-none">Início</span>}
          </Link>
          {signed && (
            <SubMenu
              isOpen={isOpen}
              title="Denkitsu AI"
              icon={Bot}
              items={aiItems}
              isSubMenuOpen={openSubMenu === "ai"}
              toggleSubMenu={() => handleSubMenuToggle("ai")}
            />
          )}
          <SubMenu
            isOpen={isOpen}
            title="Ferramentas"
            icon={Star}
            items={toolItems}
            isSubMenuOpen={openSubMenu === "tools"}
            toggleSubMenu={() => handleSubMenuToggle("tools")}
          />
          {signed && (
            <SubMenu
              isOpen={isOpen}
              title="Vídeos"
              icon={Play}
              items={videoItems}
              isSubMenuOpen={openSubMenu === "video"}
              toggleSubMenu={() => handleSubMenuToggle("video")}
            />
          )}
          <div className="mt-auto mb-1">
            <hr className="border-bLight dark:border-bDark my-1" />
            <button onClick={toggleTheme} className={`${menuItemClass} ${!isOpen && "justify-center"}`} title={isOpen ? "Alternar Tema" : "Alternar Tema"}>
              <div className="w-6 h-6 flex items-center justify-center">{theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}</div>
              {isOpen && <span className="ml-1 select-none">Alternar Tema</span>}
            </button>
            <SubMenu
              isOpen={isOpen}
              title="Conta"
              icon={User}
              items={accountItems}
              isSubMenuOpen={openSubMenu === "account"}
              toggleSubMenu={() => handleSubMenuToggle("account")}
            />
            {signed && (
              <button onClick={signOut} className={`${menuItemClass} ${!isOpen && "justify-center"}`} title={isOpen ? "" : "Sair"}>
                <div className="w-6 h-6 flex items-center justify-center"><LogOut size={16} /></div>
                {isOpen && <span className="ml-1 select-none">Sair</span>}
              </button>
            )}
          </div>
        </nav>
      </aside>
      <ContentView>{children}</ContentView>
    </div>
  )
}

export default SideMenu
