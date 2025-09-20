import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Github } from "lucide-react"

import { useNotification } from "../contexts/NotificationContext"
import { getUserAccount } from "../services/account"

import SideMenu from "../components/SideMenu"
import Avatar from "../components/Avatar"
import Button from "../components/Button"

const ContentView = ({ children }) => (
  <main className="flex justify-center items-center p-2 gap-2 w-full min-h-dvh">
    {children}
  </main>
)

const Profile = () => {
  const { userID } = useParams()
  const { notifyError } = useNotification()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadUser = async () => {
      if (!userID) {
        navigate("/")
        return
      }
      setLoading(true)
      try {
        const updatedUser = await getUserAccount(userID)
        setUser(updatedUser)
      } catch (error) {
        console.error("Error fetching user account:", error)
        if (error.response && error.response.data.error) notifyError(error.response.data.error.message)
        else notifyError("Falha ao carregar dados do perfil.")
        navigate("/")
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [userID, navigate])

  return (
    <>
      {loading ? (
        <div className="p-2">
          <Button variant="secondary" $rounded loading={true} disabled />
        </div>
      ) : user && (
        <div className="flex flex-col w-full max-w-md my-40 mx-auto p-6 gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg opacity-90 dark:opacity-95">
          <div className="flex items-center gap-4">
            <Avatar src={user.avatarUrl} alt={user.name} size={20} isPro={user.plan === "plus"} />
            <div className="flex-1 flex flex-col gap-1">
              <h2 className="text-xl font-bold text-lightFg-primary dark:text-darkFg-primary truncate">{user.name}</h2>
              <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary truncate">{user.email || "E-mail não fornecido"}</p>
              <small className="text-xs text-lightFg-tertiary dark:text-darkFg-tertiary">Membro desde {new Date(user.createdAt).toLocaleDateString()}</small>
            </div>
          </div>
          {user?.githubUsername && (
            <div className="flex w-full justify-between items-center border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-2">
              <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="icon" $rounded title="Perfil no GitHub"><Github size={16} /></Button>
              </a>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default Profile
