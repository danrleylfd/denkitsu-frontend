import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { LogOut, Pencil, Trash, X, Check, Github } from "lucide-react"

import { useAuth } from "../contexts/AuthContext"
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
  const connectedUserId = userId || user._id
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
        const data = await getUserAccount(connectedUserId)
        setUserData(data)
        setName(data.name)
        setAvatarUrl(data.avatarUrl)
      } catch (err) {
        console.error(err)
        notifyError("Falha ao carregar dados do perfil.")
        navigate("/")
      } finally {
        setLoading(false)
      }
    }
    if (connectedUserId) {
        fetchUserData()
    }
  }, [connectedUserId, notifyError, navigate])

  const handleGithubConnect = () => {
    const token = sessionStorage.getItem("@Denkitsu:token")
    if (!token) {
      notifyError("Sessão inválida. Por favor, faça login novamente.")
      return
    }
    // Redireciona para o backend, passando o token como parâmetro de URL
    window.location.href = `https://denkitsu.up.railway.app/auth/github/connect?token=${token}`
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (!isEditing && userData) {
      setName(userData.name)
      setAvatarUrl(userData.avatarUrl)
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
      const updatedUser = await editUserAccount({ name, avatarUrl })
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
    if (!window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.")) return
    if (!window.confirm("ÚLTIMO AVISO: Tem certeza absoluta que deseja excluir sua conta?")) return

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
      {loading ? (
        <div className="p-2">
          <Button variant="secondary" $rounded loading={true} disabled />
        </div>
      ) : userData && (
        <div className="flex flex-col w-full max-w-md my-40 mx-auto p-6 gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg opacity-90 dark:opacity-95">
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl || userData.avatarUrl}
              alt={name || userData.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-primary-base"
            />
            {isEditing ? (
              <form className="flex-1 flex flex-col gap-2" onSubmit={handleSaveChanges}>
                <Input id="name" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
                <Input id="avatarUrl" placeholder="URL do Avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} disabled={loading} />
              </form>
            ) : (
              <div className="flex-1 flex flex-col gap-1">
                <h2 className="text-xl font-bold text-lightFg-primary dark:text-darkFg-primary truncate">{userData.name}</h2>
                <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary truncate">{userData.email || "E-mail não fornecido"}</p>
                <small className="text-xs text-lightFg-tertiary dark:text-darkFg-tertiary">Membro desde {new Date(userData.createdAt).toLocaleDateString()}</small>
              </div>
            )}
          </div>

          {user?._id === connectedUserId && (
            <div className="flex w-full justify-between items-center border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="secondary" size="icon" $rounded title="Cancelar" onClick={handleEditToggle} disabled={loading}><X size={16} /></Button>
                  <Button variant="success" size="icon" $rounded title="Salvar" onClick={handleSaveChanges} loading={loading}><Check size={16} /></Button>
                </div>
              ) : (
                <Button variant="warning" size="icon" $rounded title="Editar" onClick={handleEditToggle}><Pencil size={16} /></Button>
              )}

              <div className="flex gap-2">
                {!userData.githubId && (
                  <Button onClick={handleGithubConnect} type="button" variant="secondary" size="icon" $rounded title="Vincular com GitHub">
                    <Github size={16}/>
                  </Button>
                )}
                <Button variant="danger" size="icon" $rounded title="Deletar Conta" onClick={handleDeleteAccount} loading={loading}><Trash size={16} /></Button>
                <Button variant="danger" size="icon" $rounded title="Sair" onClick={signOut}><LogOut size={16} /></Button>
              </div>
            </div>
          )}
        </div>
      )}
    </SideMenu>
  )
}

export default Profile
