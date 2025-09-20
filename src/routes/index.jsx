// Salve em: Frontend/src/routes/index.jsx

import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import { useAuth } from "../contexts/AuthContext"

import Button from "../components/Button"
import TopMenu from "../components/TopMenu" // Importe o novo componente
import Privacidade from "../pages/Privacidade"

const SignUp = lazy(() => import("../pages/Auth/SignUp"))
const SignIn = lazy(() => import("../pages/Auth/SignIn"))
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"))
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"))
const GithubCallback = lazy(() => import("../pages/Auth/GithubCallback"))

const Shortcut = lazy(() => import("../pages/Shortcut"))
const Redirect = lazy(() => import("../pages/Redirect"))

const AI = lazy(() => import("../pages/AI"))
const Store = lazy(() => import("../pages/Store"))
const OwnProfile = lazy(() => import("../pages/OwnProfile"))
const Profile = lazy(() => import("../pages/Profile"))
const Subscription = lazy(() => import("../pages/Subscription"))
const UserVideos = lazy(() => import("../pages/Video/UserVideos"))
const Popular = lazy(() => import("../pages/Video/Popular"))
const Recents = lazy(() => import("../pages/Video/Recents"))
const VideoDetail = lazy(() => import("../pages/Video/VideoDetail"))
const Upload = lazy(() => import("../pages/Video/Upload"))
const News = lazy(() => import("../pages/News"))
const Kanban = lazy(() => import("../pages/Kanban"))
const Pomodoro = lazy(() => import("../pages/Pomodoro"))
const Translator = lazy(() => import("../pages/Translator"))
const Codebase = lazy(() => import("../pages/Codebase"))
const Editor = lazy(() => import("../pages/Editor"))
const Cinema = lazy(() => import("../pages/Cinema"))
const Clone = lazy(() => import("../pages/Clone"))

const PageLoader = () => (
  <div className="flex justify-center items-center h-dvh w-full">
    <Button variant="outline" $rounded loading={true} disabled />
  </div>
)

const AppRoutes = () => {
  const { signed, loading } = useAuth()
  if (loading) return <Button variant="outline" $rounded loading={loading} />

  // Mapeamento de rotas para classes do 'main' para manter o layout de cada página
  const mainClassMap = {
    "/": "flex flex-col flex-1",
    "/chat": "flex flex-col flex-1",
    "/cinema": "flex-1 w-full h-dvh overflow-y-auto bg-lightBg-primary dark:bg-darkBg-primary p-4",
    "/codebase": "flex flex-1 gap-2 p-2 justify-center items-center",
    "/editor": "flex-1 grid place-items-center",
    "/kanban": "flex flex-1 flex-col px-2 mx-auto w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[85%]",
    "/news": "flex flex-col gap-2 p-2 items-center mx-auto min-h-dvh w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%]",
    "/auth": "flex flex-1 flex-col gap-2 p-2 justify-center items-center",
    "/profile": "flex flex-1 gap-2 p-2 justify-center items-center",
    "/pomodoro": "flex flex-1 gap-2 p-2 justify-center items-center",
    "/subscription": "flex flex-1 gap-2 p-2 justify-center items-center",
    "/redirect": "flex flex-col justify-center gap-2 p-2 items-center mx-auto h-dvh w-full",
    "/shortcut": "flex flex-1 flex-col gap-2 p-2 justify-center items-center",
    "/store": "flex flex-col flex-1",
    "/translator": "flex flex-1 gap-2 p-2 justify-center items-center",
    "/video": "flex flex-1 flex-col gap-2 p-2 items-center mx-auto w-full md:max-w-[75%] lg:max-w-[100%]"
  }

  const getRouteElement = (Component, layoutKey) => (
    <TopMenu mainClassName={mainClassMap[layoutKey] || "flex-1 container mx-auto flex flex-col items-center"}>
      <Component />
    </TopMenu>
  )

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {signed ? (
            <>
              <Route path="/" element={getRouteElement(AI, "/")} />
              <Route path="/store" element={getRouteElement(Store, "/store")} />
              <Route path="/editor" element={getRouteElement(Editor, "/editor")} />
              <Route path="/cinema" element={getRouteElement(Cinema, "/cinema")} />
              <Route path="/news" element={getRouteElement(News, "/news")} />
              <Route path="/kanban" element={getRouteElement(Kanban, "/kanban")} />
              <Route path="/pomodoro" element={getRouteElement(Pomodoro, "/pomodoro")} />
              <Route path="/translator" element={getRouteElement(Translator, "/translator")} />
              <Route path="/codebase" element={getRouteElement(Codebase, "/codebase")} />
              <Route path="/upload" element={getRouteElement(Upload, "/auth")} />
              <Route path="/recents" element={getRouteElement(Recents, "/video")} />
              <Route path="/popular" element={getRouteElement(Popular, "/video")} />
              <Route path="/my-videos" element={getRouteElement(UserVideos, "/video")} />
              <Route path="/video/:videoId" element={getRouteElement(VideoDetail, "/video")} />
              <Route path="/profile" element={getRouteElement(OwnProfile, "/profile")} />
              <Route path="/profile/:userID" element={getRouteElement(Profile, "/profile")} />
              <Route path="/subscription" element={getRouteElement(Subscription, "/subscription")} />
              <Route path="/atalho" element={getRouteElement(Shortcut, "/shortcut")} />
              <Route path="/chat" element={getRouteElement(AI, "/chat")} />
              <Route path="/clone" element={getRouteElement(Clone, "/clone")} />
              <Route path="/privacy" element={getRouteElement(Privacidade, "/news")} />
              <Route path="/access/:label" element={getRouteElement(Redirect, "/redirect")} />
              <Route path="/auth/:label" element={getRouteElement(Redirect, "/redirect")} />
              <Route path="/*" element={getRouteElement(Redirect, "/redirect")} />
            </>
          ) : (
            <>
              <Route path="/" element={getRouteElement(AI, "/")} />
              <Route path="/news" element={getRouteElement(News, "/news")} />
              <Route path="/editor" element={getRouteElement(Editor, "/editor")} />
              <Route path="/cinema" element={getRouteElement(Cinema, "/cinema")} />
              <Route path="/kanban" element={getRouteElement(Kanban, "/kanban")} />
              <Route path="/pomodoro" element={getRouteElement(Pomodoro, "/pomodoro")} />
              <Route path="/translator" element={getRouteElement(Translator, "/translator")} />
              <Route path="/codebase" element={getRouteElement(Codebase, "/codebase")} />
              <Route path="/chat" element={getRouteElement(AI, "/chat")} />
              <Route path="/signin" element={getRouteElement(SignIn, "/auth")} />
              <Route path="/signup" element={getRouteElement(SignUp, "/auth")} />
              <Route path="/forgot_password" element={getRouteElement(ForgotPassword, "/auth")} />
              <Route path="/reset_password" element={getRouteElement(ResetPassword, "/auth")} />
              <Route path="/auth/github/callback" element={getRouteElement(GithubCallback, "/auth")} />
              <Route path="/access/:label" element={getRouteElement(Redirect, "/redirect")} />
              <Route path="/privacy" element={getRouteElement(Privacidade, "/news")} />
              <Route path="/*" element={getRouteElement(Redirect, "/redirect")} />
            </>
          )}
        </Routes>
      </Suspense>
    </Router>
  )
}

export default AppRoutes
