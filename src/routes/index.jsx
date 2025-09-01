import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import { useAuth } from "../contexts/AuthContext"

import Button from "../components/Button"
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
const Profile = lazy(() => import("../pages/Profile"))
const UserVideos = lazy(() => import("../pages/Video/UserVideos"))
const Popular = lazy(() => import("../pages/Video/Popular"))
const Recents = lazy(() => import("../pages/Video/Recents"))
const VideoDetail = lazy(() => import("../pages/Video/VideoDetail"))
const Upload = lazy(() => import("../pages/Video/Upload"))
const News = lazy(() => import("../pages/NewsCursor"))
const Kanban = lazy(() => import("../pages/Kanban"))
const Pomodoro = lazy(() => import("../pages/Pomodoro"))
const Weather = lazy(() => import("../pages/Weather"))
const Translator = lazy(() => import("../pages/Translator"))
const Codebase = lazy(() => import("../pages/Codebase"))
const Editor = lazy(() => import("../pages/Editor"))
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
              <Route path="/" element={<AI />} />
              <Route path="/store" element={<Store />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/cinema" element={<Cinema />} />
              <Route path="/news" element={<News />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/pomodoro" element={<Pomodoro />} />
              <Route path="/clima" element={<Weather />} />
              <Route path="/translator" element={<Translator />} />
              <Route path="/codebase" element={<Codebase />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/recents" element={<Recents />} />
              <Route path="/popular" element={<Popular />} />
              <Route path="/my-videos" element={<UserVideos />} />
              <Route path="/video/:videoId" element={<VideoDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/atalho" element={<Shortcut />} />
              <Route path="/chat" element={<AI />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/access/:label" element={<Redirect />} />
              <Route path="/auth/:label" element={<Redirect />} />
              <Route path="/*" element={<Redirect />} />
            </>
          ) : (
            <>
              <Route path="/" element={<AI />} />
              <Route path="/news" element={<News />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/cinema" element={<Cinema />} />
              <Route path="/todo" element={<Kanban />} />
              <Route path="/pomodoro" element={<Pomodoro />} />
              <Route path="/clima" element={<Weather />} />
              <Route path="/translator" element={<Translator />} />
              <Route path="/codebase" element={<Codebase />} />
              <Route path="/chat" element={<AI />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot_password" element={<ForgotPassword />} />
              <Route path="/reset_password" element={<ResetPassword />} />
              <Route path="/auth/github/callback" element={<GithubCallback />} />
              <Route path="/access/:label" element={<Redirect />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/*" element={<Redirect />} />
            </>
          )}
        </Routes>
      </Suspense>
    </Router>
  )
}

export default AppRoutes
