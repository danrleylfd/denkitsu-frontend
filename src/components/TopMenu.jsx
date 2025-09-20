// Salve em: Frontend/src/components/TopMenu.jsx

import { Link, useLocation, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Sun, Moon, Home, User, LogOut, Crown, ChevronDown, BrainCircuit, Star, Play,
  Bot, Store, Code, Newspaper, Edit2, Kanban, Shield,
  Clock, Languages,
  Film, Video, Upload, TrendingUp, LogIn, UserPlus, KeyRound, Link2
} from "lucide-react";

import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useBackground } from "../contexts/BackgroundContext";

import Button from "./Button";
import Avatar from "./Avatar";
import Paper from "./Paper";

const Dropdown = ({ title, icon: Icon, items }) => {
  const { pathname } = useLocation();
  const activeLinkClass = "!bg-primary-base/20 !text-primary-base";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" $rounded>
          <Icon size={16} className="md:mr-2" />
          <span className="hidden md:inline">{title}</span>
          <ChevronDown size={16} className="hidden md:inline ml-1" />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={5}
          className="z-50 bg-lightBg-primary dark:bg-darkBg-primary p-2 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] rounded-md opacity-95 dark:opacity-95 border border-bLight dark:border-bDark animate-fade-in mt-2"
        >
          {items.map(({ icon: ItemIcon, label, to, action }) => (
            <DropdownMenu.Item key={label} asChild className="focus:outline-none rounded-md">
              {to ? (
                <Link to={to}>
                  <Button
                    variant="secondary"
                    className={`w-full !justify-start ${pathname === to ? activeLinkClass : ""}`}
                    $rounded
                  >
                    <ItemIcon size={16} className="mr-2" />
                    <span>{label}</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  variant={label === "Sair" ? "danger" : "secondary"}
                  onClick={action}
                  className="w-full !justify-start"
                  $rounded
                >
                  <ItemIcon size={16} className="mr-2" />
                  <span>{label}</span>
                </Button>
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

const TopMenu = ({ children, mainClassName }) => {
  const { background } = useBackground();
  const { theme, toggleTheme } = useTheme();
  const { signed, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeLinkClass = "!bg-primary-base/20 !text-primary-base";

  const handleSignOut = () => {
    signOut();
    navigate("/signin");
  };

  const aiItems = [
    { icon: Bot, label: "Chat", to: "/chat" },
    { icon: Store, label: "Loja", to: "/store" },
    { icon: Code, label: "Codebase", to: "/codebase" },
    { icon: Newspaper, label: "Notícias", to: "/news" },
    { icon: Edit2, label: "Editor", to: "/editor" },
    { icon: Kanban, label: "Kanban", to: "/kanban" },
    { icon: Shield, label: "Privacidade", to: "/privacy" },
  ];

  const toolItems = [
    { icon: Clock, label: "Pomodoro", to: "/pomodoro" },
    { icon: Languages, label: "Tradutor", to: "/translator" },
  ];

  const videoItems = [
    { icon: Film, label: "Cinema", to: "/cinema" },
    { icon: Video, label: "Meus Vídeos", to: "/my-videos" },
    { icon: Upload, label: "Upload", to: "/upload" },
    { icon: TrendingUp, label: "Populares", to: "/popular" },
    { icon: Play, label: "Recentes", to: "/recents" },
  ];

  const authItems = [
    { icon: LogIn, label: "Entrar", to: "/signin" },
    { icon: UserPlus, label: "Cadastrar", to: "/signup" },
    { icon: KeyRound, label: "Esqueci a senha", to: "/forgot_password" },
    { icon: KeyRound, label: "Redefinir senha", to: "/reset_password" }
  ];

  const accountItems = [
    { icon: User, label: "Perfil", to: "/profile" },
    { icon: Link2, label: "Atalho", to: "/atalho" },
    { icon: LogOut, label: "Sair", action: handleSignOut }
  ];

  return (
    <div className="flex flex-col min-h-dvh bg-cover bg-center bg-fixed" style={{ backgroundImage: `url("${background}")` }}>
      <header className="sticky top-0 z-40 w-full p-2">
        <Paper className="!max-w-full flex items-center justify-between p-2 gap-2">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img src="/denkitsu-rounded.png" alt="Denkitsu Logo" className="w-8 h-8" />
              <span className="hidden md:inline font-bold text-lg text-lightFg-primary dark:text-darkFg-primary">Denkitsu</span>
            </Link>
          </div>

          <nav className="flex items-center gap-2">
            <Link to="/"><Button variant="secondary" $rounded><Home size={16} className="md:mr-2" /><span className="hidden md:inline">Início</span></Button></Link>
            {signed && <Dropdown title="Inteligência" icon={BrainCircuit} items={aiItems} />}
            <Dropdown title="Ferramentas" icon={Star} items={toolItems} />
            {signed && <Dropdown title="Vídeos" icon={Play} items={videoItems} />}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" $rounded onClick={toggleTheme} title="Alternar Tema">
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
            {signed && user ? (
              <>
                <Link to="/subscription">
                  <Button variant="warning" size="icon" $rounded title={user.plan === "free" ? "Fazer Upgrade" : "Gerenciar Assinatura"}>
                    <Crown size={16} />
                  </Button>
                </Link>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button variant="secondary" size="icon" $rounded className="!p-0">
                      <Avatar src={user.avatarUrl} alt={user.name} size={8} isPro={user.plan === "plus"} />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content sideOffset={5} className="z-50 bg-lightBg-primary dark:bg-darkBg-primary p-2 shadow-[6px_6px_16px_rgba(0,0,0,0.5)] rounded-md opacity-95 dark:opacity-95 border border-bLight dark:border-bDark animate-fade-in mt-2 mr-2">
                      {accountItems.map(({ icon: ItemIcon, label, to, action }) => (
                        <DropdownMenu.Item key={label} asChild className="focus:outline-none rounded-md">
                          {to ? (
                            <Link to={to}>
                              <Button
                                variant="secondary"
                                className={`w-full !justify-start ${pathname === to ? activeLinkClass : ""}`}
                                $rounded
                              >
                                <ItemIcon size={16} className="mr-2" />
                                <span>{label}</span>
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              variant={label === "Sair" ? "danger" : "secondary"}
                              onClick={action}
                              className="w-full !justify-start !rounded-full"
                              $rounded
                            >
                              <ItemIcon size={16} className="mr-2" />
                              <span>{label}</span>
                            </Button>
                          )}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </>
            ) : (
                <Dropdown title="Acessar" icon={User} items={authItems} />
            )}
          </div>
        </Paper>
      </header>
      <main className={mainClassName || "flex-1 container mx-auto flex flex-col items-center"}>
        {children}
      </main>
    </div>
  )
}

export default TopMenu
