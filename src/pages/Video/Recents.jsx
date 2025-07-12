import { useState, useEffect } from "react"

import { useNotification } from "../../contexts/NotificationContext"

import { getRecentVideos } from "../../services/video"

import SideMenu from "../../components/SideMenu"
import VideoFeed from "../../components/Video/Feed"
import Button from "../../components/Button"

const ContentView = ({ children, ...props }) => (
  <main
    {...props}
    className="flex flex-col items-center p-2 gap-2 mx-auto w-full xs:max-w-[100%] sm:max-w-[90%] ml-[3.5rem] md:max-w-[75%] lg:max-w-[100%]">
    {children}
  </main>
)

const Recents = () => {
  const { notifyInfo, notifyError } = useNotification()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        const [recentData] = await Promise.all([getRecentVideos()])
        if(recentData?.length === 0) notifyInfo("Nenhum vídeo encontrado.")
        setVideos(recentData || [])
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
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple min-h-screen">
      {loading && <Button $rounded loading={loading} disabled />}
      {!loading && videos.length > 0 && <VideoFeed videos={videos} />}
    </SideMenu>
  )
}

export default Recents
