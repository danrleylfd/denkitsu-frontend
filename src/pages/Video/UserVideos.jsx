import { useState, useEffect } from "react"

import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"

import { getVideosByUser } from "../../services/video"

import SideMenu from "../../components/SideMenu"
import VideoFeed from "../../components/Video/Feed"
import Button from "../../components/Button"

const ContentView = ({ children, ...props }) => (
  <main
    {...props}
    className="flex flex-col items-center p-2 gap-2 mx-auto w-full xs:max-w-[100%] sm:max-w-[90%] ml-[3.5rem] md:max-w-[75%] lg:max-w-[100%] min-h-dvh">
    {children}
  </main>
)

const UserVideos = () => {
  const { user } = useAuth()
  const { notifyInfo, notifyError } = useNotification()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?._id) return
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const data = await getVideosByUser(user._id)
        if (data?.length === 0) notifyInfo("Você ainda não publicou vídeos.")
        setVideos(data || [])
      } catch (err) {
        if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
        else notifyError("Falha ao carregar seus vídeos.")
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [user?._id])

  return (
    <>
      {loading && <Button size="icon" $rounded loading={loading} disabled />}
      {!loading && videos.length > 0 && <VideoFeed videos={videos} />}
    </>
  )
}

export default UserVideos
