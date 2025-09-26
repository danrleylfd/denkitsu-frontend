import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import { useAuth } from "../contexts/AuthContext"

import SideMenu from "../components/SideMenu"
import Button from "../components/Button"


const SignUp = lazy(() => import("../pages/Auth/SignUp"))
const SignIn = lazy(() => import("../pages/Auth/SignIn"))
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"))
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"))
const GithubCallback = lazy(() => import("../pages/Auth/GithubCallback"))
const OwnProfile = lazy(() => import("../pages/OwnProfile"))
const Profile = lazy(() => import("../pages/Profile"))

const Shortcut = lazy(() => import("../pages/Shortcut"))
const Redirect = lazy(() => import("../pages/Redirect"))

const AI = lazy(() => import("../pages/AI"))
const Store = lazy(() => import("../pages/Store"))
const Privacidade = lazy(() => import("../pages/Privacidade"))
const Subscription = lazy(() => import("../pages/Subscription"))
const UserVideos = lazy(() => import("../pages/Video/UserVideos"))
const Popular = lazy(() => import("../pages/Video/Popular"))
const Recents = lazy(() => import("../pages/Video/Recents"))
const VideoDetail = lazy(() => import("../pages/Video/VideoDetail"))
const Upload = lazy(() => import("../pages/Video/Upload"))
const News = lazy(() => import("../pages/News"))
const Kanban = lazy(() => import("../pages/Kanban"))
const Codebase = lazy(() => import("../pages/Codebase"))
const Editor = lazy(() => import("../pages/Editor"))
const Translator = lazy(() => import("../pages/Translator"))
const Cinema = lazy(() => import("../pages/Cinema"))

const PageLoader = () => (
  <div className="flex justify-center items-center h-dvh w-full">
    <Button variant="outline" $rounded loading={true} disabled />
  </div>
)

const AppRoutes = () => {
  const { signed, loading } = useAuth()
  if (loading) return <Button variant="outline" $rounded loading={loading} />

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {signed ? (
            <>
              <Route path="/" element={<SideMenu><AI /></SideMenu>} />
              <Route path="/store" element={<SideMenu><Store /></SideMenu>} />
              <Route path="/editor" element={<SideMenu><Editor /></SideMenu>} />
              <Route path="/cinema" element={<SideMenu><Cinema /></SideMenu>} />
              <Route path="/news" element={<SideMenu><News /></SideMenu>} />
              <Route path="/kanban" element={<SideMenu><Kanban /></SideMenu>} />
              <Route path="/translator" element={<SideMenu><Translator /></SideMenu>} />
              <Route path="/codebase" element={<SideMenu><Codebase /></SideMenu>} />
              <Route path="/upload" element={<SideMenu><Upload /></SideMenu>} />
              <Route path="/recents" element={<SideMenu><Recents /></SideMenu>} />
              <Route path="/popular" element={<SideMenu><Popular /></SideMenu>} />
              <Route path="/my-videos" element={<SideMenu><UserVideos /></SideMenu>} />
              <Route path="/video/:videoId" element={<SideMenu><VideoDetail /></SideMenu>} />
              <Route path="/profile" element={<SideMenu><OwnProfile /></SideMenu>} />
              <Route path="/profile/:userID" element={<SideMenu><Profile /></SideMenu>} />
              <Route path="/subscription" element={<SideMenu><Subscription /></SideMenu>} />
              <Route path="/atalho" element={<SideMenu><Shortcut /></SideMenu>} />
              <Route path="/chat" element={<SideMenu><AI /></SideMenu>} />
              <Route path="/privacy" element={<SideMenu><Privacidade /></SideMenu>} />
              <Route path="/access/:label" element={<SideMenu><Redirect /></SideMenu>} />
              <Route path="/auth/:label" element={<SideMenu><Redirect /></SideMenu>} />
              <Route path="/*" element={<SideMenu><Redirect /></SideMenu>} />
            </>
          ) : (
            <>
              <Route path="/" element={<SideMenu><AI /></SideMenu>} />
              <Route path="/news" element={<SideMenu><News /></SideMenu>} />
              <Route path="/editor" element={<SideMenu><Editor /></SideMenu>} />
              <Route path="/cinema" element={<SideMenu><Cinema /></SideMenu>} />
              <Route path="/kanban" element={<SideMenu><Kanban /></SideMenu>} />
              <Route path="/translator" element={<SideMenu><Translator /></SideMenu>} />
              <Route path="/codebase" element={<SideMenu><Codebase /></SideMenu>} />
              <Route path="/chat" element={<SideMenu><AI /></SideMenu>} />
              <Route path="/signin" element={<SideMenu><SignIn /></SideMenu>} />
              <Route path="/signup" element={<SideMenu><SignUp /></SideMenu>} />
              <Route path="/forgot_password" element={<SideMenu><ForgotPassword /></SideMenu>} />
              <Route path="/reset_password" element={<SideMenu><ResetPassword /></SideMenu>} />
              <Route path="/auth/github/callback" element={<SideMenu><GithubCallback /></SideMenu>} />
              <Route path="/access/:label" element={<SideMenu><Redirect /></SideMenu>} />
              <Route path="/privacy" element={<SideMenu><Privacidade /></SideMenu>} />
              <Route path="/*" element={<SideMenu><Redirect /></SideMenu>} />
            </>
          )}
        </Routes>
      </Suspense>
    </Router>
  )
}

export default AppRoutes
