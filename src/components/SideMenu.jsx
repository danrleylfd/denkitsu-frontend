import { useEffect, useSyncExternalStore } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Menu, X, Sun, Moon, Home, Newspaper, Cloud, Languages, Clock, Code, Bot, Kanban, Link2,
  User, LogIn, UserPlus, LogOut, Film, Edit2, ChevronDown, ChevronRight,
  Upload, Video, TrendingUp, Play, Star, Lock, KeyRound, Store, Shield,
} from "lucide-react"

import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { useBackground } from "../contexts/BackgroundContext"

import { storage } from "../utils/storage"

let menuState = {
  isOpen: false,
  openSubMenu: null,
}

let listeners = []
let isInitialized = false

const emitChange = () => {
  for (let listener of listeners) {
    listener()
  }
}

const initializeMenuState = async () => {
  if (isInitialized) return
  isInitialized = true
  const savedMenuState = await storage.local.getItem("@Denkitsu:menuState")
  const savedOpenSubMenu = await storage.local.getItem("@Denkitsu:openSubMenu")
  menuState = {
    isOpen: savedMenuState === "opened",
    openSubMenu: savedOpenSubMenu || null,
  }
  emitChange()
}

const toggleMenu = () => {
  menuState = { ...menuState, isOpen: !menuState.isOpen }
  storage.local.setItem("@Denkitsu:menuState", menuState.isOpen ? "opened" : "closed")
  emitChange()
}

const handleSubMenuToggle = (submenuName) => {
  const newOpenSubMenu = menuState.openSubMenu === submenuName ? null : submenuName
  menuState = { ...menuState, openSubMenu: newOpenSubMenu }
  if (newOpenSubMenu) storage.local.setItem("@Denkitsu:openSubMenu", newOpenSubMenu)
  else storage.local.removeItem("@Denkitsu:openSubMenu")
  emitChange()
}

const useMenuStore = () => {
  const subscribe = (callback) => {
    listeners.push(callback)
    return () => {
      listeners = listeners.filter(l => l !== callback)
    }
  }
  const getSnapshot = () => {
    return menuState
  }
  return useSyncExternalStore(subscribe, getSnapshot)
}

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
  const { signed, user, signOut } = useAuth()

  const { isOpen, openSubMenu } = useMenuStore()

  useEffect(() => {
    initializeMenuState()
  }, [])

  const aiItems = [
    { icon: Bot, label: "Chat", to: "/chat" },
    { icon: Store, label: "Loja", to: "/store" },
    { icon: Code, label: "Codebase", to: "/codebase" },
    { icon: Edit2, label: "Editor", to: "/editor" },
    { icon: Kanban, label: "Kanban", to: "/kanban" },
    { icon: Shield, label: "Privacidade", to: "/privacidade" },
  ]

  const toolItems = [
    { icon: Newspaper, label: "Notícias", to: "/news" },
    { icon: Clock, label: "Pomodoro", to: "/pomodoro" },
    { icon: Cloud, label: "Clima", to: "/clima" },
    { icon: Languages, label: "Tradutor", to: "/translator" },
  ]

  const videoItems = [
    { icon: Film, label: "Cinema", to: "/cinema" },
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
    <div className={`flex ${className || ""}`} style={{ backgroundImage: `url("${background}")` }}>
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
            <Link to="/subscription" className={`${menuItemClass} bg-amber-base/10 text-amber-dark hover:bg-amber-base/20 dark:text-amber-light dark:hover:bg-amber-base/20 ${pathname === "/subscription" ? "border-l-4 border-amber-base" : ""} ${!isOpen && "justify-center"}`} title="Plano Pro">
              <div className="w-6 h-6 flex items-center justify-center"><Crown size={16} /></div>
              {isOpen && <span className="ml-1 select-none font-bold">{user.plan === "free" ? "Upgrade" : "Gerenciar Assinatura"}</span>}
            </Link>
          )}
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
