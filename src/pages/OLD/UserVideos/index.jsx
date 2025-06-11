import { useState, useEffect } from "react"

import { useAuth } from "../../../contexts/AuthContext"
import { getVideosByUser } from "../../../services/video"

import SideMenu from "../../../components/SideMenu"
import Feed from "../../../components/Feed"
import Button from "../../../components/Button"
import { MessageError } from "../../../components/Notifications"

import { SideContentContainer } from "./styles"

const UserVideos = () => {
  const { user } = useAuth()
  const [userVideos, setUserVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    if (!user?._id) return
    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getVideosByUser(user._id)
        setUserVideos(data || [])
      } catch (err) {
        if (err.response?.status === 404) {
          setUserVideos([])
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
    <SideMenu style={{ position: "fixed" }} ContentView={SideContentContainer}>
      {loading && <Button variant="outline" $rounded loading={loading} disabled />}
      {error && <MessageError>{error}</MessageError>}
      {!loading && !error && <Feed videos={userVideos} />}
    </SideMenu>
  )
}

export default UserVideos
