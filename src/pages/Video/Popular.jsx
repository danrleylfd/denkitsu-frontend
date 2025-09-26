import { useState, useEffect } from "react"

import { useNotification } from "../../contexts/NotificationContext"

import { getPopularVideos } from "../../services/video"

import VideoFeed from "../../components/Video/Feed"
import Button from "../../components/Button"

const Popular = () => {
  const { notifyInfo, notifyError } = useNotification()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const popularData = await getPopularVideos()
        if (popularData?.length === 0) notifyInfo("Nenhum vídeo encontrado.")
        setVideos(popularData || [])
      } catch (err) {
        console.error(err)
        if (err.response.status === 404) {
          setVideos([])
          notifyInfo("Nenhum vídeo encontrado.")
          return
        }
        notifyError("Falha ao carregar vídeos. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-2 mt-2 overflow-y-auto">
      {loading && <Button size="icon" $rounded loading={loading} disabled />}
      {!loading && videos.length > 0 && <VideoFeed videos={videos} />}
    </div>
  )
}

export default Popular
