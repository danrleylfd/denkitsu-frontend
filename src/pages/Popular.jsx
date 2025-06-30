import { useState, useEffect } from "react"

import { getPopularVideos } from "../services/video"

import SideMenu from "../components/SideMenu"
import VideoFeed from "../components/VideoFeed"
import Button from "../components/Button"
import { MessageBase, MessageError } from "../components/Notifications"

const ContentView = ({ children, ...props }) => (
  <main
    {...props}
    className="flex flex-col items-center p-2 gap-2 mx-auto w-full xs:max-w-[100%] sm:max-w-[90%] ml-[3.5rem] md:max-w-[75%] lg:max-w-[100%]"
    data-oid="1l3yw8s">
    {children}
  </main>
)

const Popular = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)
        const popularData = await getPopularVideos()
        setVideos(popularData || [])
      } catch (err) {
        if (err.response.status === 404) {
          setVideos([])
          return
        }
        setError("Falha ao carregar vídeos. Tente novamente mais tarde.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple min-h-screen" data-oid="dez9-ah">
      {loading && <Button $rounded loading={loading} disabled data-oid="7-3ynga" />}
      {error && <MessageError data-oid="ds8ayxk">{error}</MessageError>}
      {!loading && videos.length === 0 && <MessageBase data-oid="qu46d4x">Nenhum vídeo encontrado.</MessageBase>}
      {!loading && !error && videos.length > 0 && <VideoFeed videos={videos} data-oid="w2w6-n0" />}
    </SideMenu>
  )
}

export default Popular
