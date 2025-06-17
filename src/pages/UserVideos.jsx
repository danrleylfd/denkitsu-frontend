import { useState, useEffect } from "react"

import { useAuth } from "../contexts/AuthContext"
import { getVideosByUser } from "../services/video"

import SideMenu from "../components/SideMenu"
import Feed from "../components/Feed"
import Button from "../components/Button"
import { MessageBase, MessageError } from "../components/Notifications"

const ContentView = ({ children, ...props }) => <main {...props} className="flex flex-col items-center p-2 gap-2 mx-auto w-full xs:max-w-[100%] sm:max-w-[90%] ml-[3.5rem] md:max-w-[75%] lg:max-w-[100%]">{children}</main>

const UserVideos = () => {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    if (!user?._id) return
    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getVideosByUser(user._id)
        setVideos(data || [])
      } catch (err) {
        if (err.response?.status === 404) {
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
  }, [user._id])

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple min-h-screen">
      {loading && <Button $rounded loading={loading} disabled />}
      {error && <MessageError>{error}</MessageError>}
      {!loading && videos.length === 0 && <MessageBase>Nenhum vídeo encontrado.</MessageBase>}
      {!loading && !error && videos.length > 0 && <Feed videos={videos} />}
    </SideMenu>
  )
}

export default UserVideos
