import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import { useAuth } from "../contexts/AuthContext"

import Button from "../components/Button"

import SignUp from "../pages/Auth/SignUp"
import SignIn from "../pages/Auth/SignIn"
import ForgotPassword from "../pages/Auth/ForgotPassword"
import ResetPassword from "../pages/Auth/ResetPassword"

import Linkers from "../pages/Atalho/Linkers"
import Redirect from "../pages/Atalho/Redirect"

import AI from "../pages/AI"
import Profile from "../pages/Profile"
import UserVideos from "../pages/Videos/UserVideos"
import Popular from "../pages/Videos/Popular"
import Recents from "../pages/Videos/Recents"
import VideoDetail from "../pages/Videos/VideoDetail"
import Upload from "../pages/Videos/Upload"
import News from "../pages/News"
import Todo from "../pages/Todo"
import Pomodoro from "../pages/Pomodoro"
import Weather from "../pages/Weather"

const AppRoutes = () => {
  const { signed, loading } = useAuth()
  if (loading) return <Button variant="outline" $rounded loading={loading}/>
  return (
    <Router>
      <Routes>
        {signed ? (
          <>
            <Route path="/" element={<News />} />
            <Route path="/news" element={<News />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/clima" element={<Weather />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/recents" element={<Recents />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/my-videos" element={<UserVideos />} />
            <Route path="/video/:videoId" element={<VideoDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/atalho" element={<Linkers />} />
            <Route path="/chat" element={<AI />} />
            <Route path="/access/:label" element={<Redirect />} />
            <Route path="/auth/:label" element={<Redirect />} />
            <Route path="/*" element={<Redirect />} />
          </>
        ) : (
          <>
            <Route path="/" element={<News />} />
            <Route path="/news" element={<News />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/clima" element={<Weather />} />
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
