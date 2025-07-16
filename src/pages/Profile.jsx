import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { LogOut, Pencil, Trash, X, Check } from "lucide-react"

import { useAuth } from "../contexts/AuthContext"
import { useAI } from "../contexts/AIContext"
import { useNotification } from "../contexts/NotificationContext"

import { getUserAccount, editUserAccount, deleteUserAccount } from "../services/account"

import SideMenu from "../components/SideMenu"
import Input from "../components/Input"
import Button from "../components/Button"

const ContentView = ({ children }) => (
  <main className="flex justify-center items-center p-2 gap-2 min-h-screen w-full">
    {children}
  </main>
)

const Profile = () => {
  const { userId } = useParams()
  const { user, signOut, updateUser } = useAuth()
  const { notifyWarning, notifyError } = useNotification()
  const userID = userId || user._id
  const [userData, setUserData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const data = await getUserAccount(userID)
        setUserData(data)
        setName(data?.name)
        setAvatarUrl(data?.avatarUrl)
      } catch (err) {
        console.error(err)
        notifyError("Falha ao carregar dados do perfil.")
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [user?._id])

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (isEditing && userData) {
      setName(userData?.name)
      setAvatarUrl(userData?.avatarUrl)
    }
  }

  const handleSaveChanges = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!name || !avatarUrl) {
        notifyWarning("Nome e URL do avatar são obrigatórios.")
        return
      }
      const updatedUser = await editUserAccount({ name, avatarUrl: user.name !== name ? avatarUrl.replace(user.name, name) : avatarUrl })
      setUserData(updatedUser)
      updateUser(updatedUser)
      setIsEditing(false)
    } catch (err) {
      notifyError(err.response?.data?.error || "Falha ao atualizar perfil.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados (atalhos, vídeos, curtidas, comentários, compartilhamentos, etc.) serão perdidos."
    )
    if (!confirmDelete) return
    const confirmDeleteTwo = window.confirm("Tem certeza que deseja excluir sua conta?")
    if (!confirmDeleteTwo) return
    setLoading(true)
    try {
      await deleteUserAccount()
      signOut()
      navigate("/")
      alert("Conta excluída com sucesso.")
    } catch (err) {
      console.log(err)
      notifyError(err.response?.data?.error || "Falha ao excluir conta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      {loading && !userData && (
        <div className="p-2">
          <Button variant="secondary" $rounded loading={loading} disabled />
        </div>
      )}
      {!loading && (
        <div
          className="flex w-max h-max my-40 min-w-96 mx-auto p-4 gap-2 items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-[8rem_0.5rem_0.5rem_8rem] shadow-[6px_6px_16px_rgba(0,0,0,0.5)] opacity-75 dark:opacity-90">
          <img
            src={avatarUrl || userData?.avatarUrl}
            alt={name || userData.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-violet-500"
          />
          {userID === user._id && isEditing ? (
            <form className="flex-1 flex flex-col gap-0 items-center" onSubmit={(e) => e.preventDefault()}>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
              <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} disabled={loading} />
              <div className="flex w-full gap-2 justify-between">
                <Button variant="secondary" size="icon" $rounded title="Cancelar" onClick={handleEditToggle} loading={loading}>
                  <X size={16} />
                </Button>
                <Button variant="success" size="icon" $rounded title="Salvar" onClick={handleSaveChanges} loading={loading}>
                  <Check size={16} />
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex-1 flex flex-col gap-2">
              <h5 className="text-lg font-bold text-lightFg-primary dark:text-darkFg-primary">
                {userData?.name}
              </h5>
              <p className="text-lightFg-secondary dark:text-darkFg-secondary">
                @{userData?.email?.split("@")[0]}
              </p>
              <small className="text-xs text-lightFg-secondary dark:text-darkFg-secondary">
                Conta criada em {new Date(userData?.createdAt).toLocaleString()}
              </small>
              <small className="text-xs text-lightFg-secondary dark:text-darkFg-secondary">
                Conta editada em {new Date(userData?.updatedAt).toLocaleString()}
              </small>
              {userID === user._id && (
                <div className="flex-1 flex flex-col gap-0 items-center">
                  <div className="flex w-full gap-2 justify-between">
                    <Button variant="warning" size="icon" $rounded title="Editar" onClick={handleEditToggle}>
                      <Pencil size={16} />
                    </Button>
                    <Button variant="danger" size="icon" $rounded title="Deletar Conta" onClick={handleDeleteAccount} loading={loading}>
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <Button variant="danger" size="icon" $rounded title="Sair" onClick={signOut}>
            <LogOut size={16} />
          </Button>
        </div>
      )}
    </SideMenu>
  )
}

export default Profile
