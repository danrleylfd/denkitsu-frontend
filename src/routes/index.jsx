import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import { useAuth } from "../contexts/AuthContext"

import Button from "../components/Button"

import SignUp from "../pages/SignUp"
import SignIn from "../pages/SignIn"
import ForgotPassword from "../pages/ForgotPassword"
import ResetPassword from "../pages/ResetPassword"

import Shortcut from "../pages/Shortcut"
import Redirect from "../pages/Redirect"

import AI from "../pages/AI"
import Profile from "../pages/Profile"
import UserVideos from "../pages/UserVideos"
import Popular from "../pages/Popular"
import Recents from "../pages/Recents"
import VideoDetail from "../pages/VideoDetail"
import Upload from "../pages/Upload"
import News from "../pages/News"
import Kanban from "../pages/Kanban"
import Pomodoro from "../pages/Pomodoro"
import Weather from "../pages/Weather"

const AppRoutes = () => {
  const { signed, loading } = useAuth()
  if (loading) return <Button variant="outline" $rounded loading={loading} data-oid="yl.grmn" />
  return (
    <Router data-oid="-ckjpu9">
      <Routes data-oid="xwyp:f.">
        {signed ? (
          <>
            <Route path="/" element={<News data-oid="nb71fd8" />} data-oid="8h:xr1p" />
            <Route path="/news" element={<News data-oid="_aq9dz3" />} data-oid="v04q9i3" />
            <Route path="/kanban" element={<Kanban data-oid="iwim8ce" />} data-oid="jqy52t2" />
            <Route path="/pomodoro" element={<Pomodoro data-oid="siskdnk" />} data-oid="qo5_vmv" />
            <Route path="/clima" element={<Weather data-oid="ylrya4l" />} data-oid="kirdbvr" />
            <Route path="/upload" element={<Upload data-oid="2-oz302" />} data-oid=":wdmy4j" />
            <Route path="/recents" element={<Recents data-oid="e_7mslh" />} data-oid="c610:9f" />
            <Route path="/popular" element={<Popular data-oid="15koe.1" />} data-oid="qqht1j1" />
            <Route path="/my-videos" element={<UserVideos data-oid="n6l1f5i" />} data-oid="it34b.w" />
            <Route path="/video/:videoId" element={<VideoDetail data-oid="1z_nr3h" />} data-oid="_s7ceqk" />
            <Route path="/profile" element={<Profile data-oid="32t:_ws" />} data-oid="b:y3xol" />
            <Route path="/profile/:userId" element={<Profile data-oid="iyrtn6f" />} data-oid="ru13jfi" />
            <Route path="/atalho" element={<Shortcut data-oid="d9p6h6v" />} data-oid="-oei0er" />
            <Route path="/chat" element={<AI data-oid="43o04o1" />} data-oid="a:a4g78" />
            <Route path="/access/:label" element={<Redirect data-oid="sceqjs3" />} data-oid="fewf:gb" />
            <Route path="/auth/:label" element={<Redirect data-oid="iz9l5zz" />} data-oid="efvdt_0" />
            <Route path="/*" element={<Redirect data-oid=":9mvsem" />} data-oid="_2-6t_i" />
          </>
        ) : (
          <>
            <Route path="/" element={<News data-oid="a_d0j4c" />} data-oid="4wxok5v" />
            <Route path="/news" element={<News data-oid="4hf4e67" />} data-oid="3kpad0_" />
            <Route path="/todo" element={<Kanban data-oid="bt3h:kh" />} data-oid="zojlu9a" />
            <Route path="/pomodoro" element={<Pomodoro data-oid="_x__bf1" />} data-oid="m0o3rny" />
            <Route path="/clima" element={<Weather data-oid="cba75gg" />} data-oid="ji01yn3" />
            <Route path="/signin" element={<SignIn data-oid="zk-klme" />} data-oid="7_y_6:3" />
            <Route path="/signup" element={<SignUp data-oid="6d54dz-" />} data-oid="q1-qsp0" />
            <Route path="/forgot_password" element={<ForgotPassword data-oid=".fi82jr" />} data-oid="gwbiq:t" />
            <Route path="/reset_password" element={<ResetPassword data-oid="9j1craz" />} data-oid="ow7rijf" />
            <Route path="/access/:label" element={<Redirect data-oid="vb46g4u" />} data-oid="i6k.09e" />
            <Route path="/*" element={<Redirect data-oid="59b1:0n" />} data-oid="sritmnd" />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default AppRoutes
