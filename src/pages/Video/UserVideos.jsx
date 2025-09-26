import { useState, useEffect } from "react"

import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"

import { getVideosByUser } from "../../services/video"

import VideoFeed from "../../components/Video/Feed"
import Button from "../../components/Button"

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
    <div className="flex flex-1 flex-col gap-2 mt-2 overflow-y-auto">
      {loading && <Button size="icon" $rounded loading={loading} disabled />}
      {!loading && videos.length > 0 && <VideoFeed videos={videos} />}
    </div>
  )
}

export default UserVideos
