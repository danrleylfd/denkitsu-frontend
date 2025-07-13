import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import { useAuth } from "../contexts/AuthContext"

import Button from "../components/Button"

import SignUp from "../pages/Auth/SignUp"
import SignIn from "../pages/Auth/SignIn"
import ForgotPassword from "../pages/Auth/ForgotPassword"
import ResetPassword from "../pages/Auth/ResetPassword"

import Shortcut from "../pages/Shortcut"
import Redirect from "../pages/Redirect"

import AI from "../pages/AI"
import Profile from "../pages/Profile"
import UserVideos from "../pages/Video/UserVideos"
import Popular from "../pages/Video/Popular"
import Recents from "../pages/Video/Recents"
import VideoDetail from "../pages/Video/VideoDetail"
import Upload from "../pages/Video/Upload"
import News from "../pages/News"
import Kanban from "../pages/Kanban"
import Pomodoro from "../pages/Pomodoro"
import Weather from "../pages/Weather"
import Translator from "../pages/Translator"
import Codebase from "../pages/Codebase"
import Editor from "../pages/Editor"

const AppRoutes = () => {
  const { signed, loading } = useAuth()
  if (loading) return <Button variant="outline" $rounded loading={loading} />
  return (
    <Router>
      <Routes>
        {signed ? (
          <>
            <Route path="/" element={<News />} />
            <Route path="/editor" element={<Editor />} />
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
            <Route path="/access/:label" element={<Redirect />} />
            <Route path="/auth/:label" element={<Redirect />} />
            <Route path="/*" element={<Redirect />} />
          </>
        ) : (
          <>
            <Route path="/" element={<News />} />
            <Route path="/news" element={<News />} />
            <Route path="/editor-qwe" element={<Editor />} />
            <Route path="/todo" element={<Kanban />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/clima" element={<Weather />} />
            <Route path="/translator" element={<Translator />} />
            <Route path="/codebase" element={<Codebase />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot_password" element={<ForgotPassword />} />
            <Route path="/reset_password" element={<ResetPassword />} />
            <Route path="/access/:label" element={<Redirect />} />
            <Route path="/*" element={<Redirect />} />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default AppRoutes
