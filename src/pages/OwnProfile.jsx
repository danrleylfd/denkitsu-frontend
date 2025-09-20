import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, Pencil, Trash, X, Check, Github } from "lucide-react"

import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"
import { editUserAccount, deleteUserAccount, unlinkGithubAccount } from "../services/account"

import SideMenu from "../components/SideMenu"
import Avatar from "../components/Avatar"
import Input from "../components/Input"
import Button from "../components/Button"

const ContentView = ({ children }) => (
  <main className="flex justify-center items-center p-2 gap-2 w-full min-h-dvh">
    {children}
  </main>
)

const OwnProfile = () => {
  const { user, signOut, loadUser, updateUser } = useAuth()
  const { notifyWarning, notifyError, notifyInfo } = useNotification()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate("/signin")
    else {
      setName(user.name)
      setAvatarUrl(user.avatarUrl)
    }
  }, [user, navigate])

  const handleGithubConnect = () => {
    const token = sessionStorage.getItem("@Denkitsu:token")
    if (!token) {
      notifyError("Sessão inválida. Por favor, faça login novamente.")
      return
    }
    window.location.href = `https://denkitsu.up.railway.app/auth/github/connect?token=${token}`
  }

  const handleGithubUnlink = async () => {
    if (!window.confirm("Tem certeza que deseja desvincular sua conta do GitHub? Você precisará usar seu e-mail e senha para fazer login.")) return
    setLoading(true)
    try {
      const partialUser = await unlinkGithubAccount()
      await updateUser(partialUser)
      notifyInfo("Conta do GitHub desvinculada com sucesso!")
    } catch (error) {
      console.error("Error unlinking GitHub account:", error)
      if (error.response && error.response.data.error) notifyError(error.response.data.error.message)
      else notifyError("Falha ao desvincular a conta do GitHub.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (isEditing) {
      setName(user.name)
      setAvatarUrl(user.avatarUrl)
    }
  }

  const handleSaveChanges = async (e) => {
    e.preventDefault()
    if (!name.trim() || !avatarUrl.trim()) {
      notifyWarning("Nome e URL do avatar são obrigatórios.")
      return
    }
    setLoading(true)
    try {
      const partialUser = await editUserAccount({ name, avatarUrl })
      await updateUser(partialUser)
      setIsEditing(false)
      notifyInfo("Perfil atualizado com sucesso!")
    } catch (error) {
      console.error("Error updating user account:", error)
      if (error.response && error.response.data.error) notifyError(error.response.data.error.message)
      else notifyError("Falha ao atualizar o perfil.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut()
    navigate("/signin")
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.")) return
    if (!window.confirm("ÚLTIMO AVISO: Tem certeza absoluta que deseja excluir sua conta?")) return
    setLoading(true)
    try {
      await deleteUserAccount()
      notifyInfo("Conta excluída com sucesso.")
      signOut()
      navigate("/signup")
    } catch (error) {
      console.error("Error deleting user account:", error)
      if (error.response && error.response.data.error) notifyError(error.response.data.error.message)
      else notifyError("Falha ao excluir a conta.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="p-2"><Button variant="secondary" $rounded loading={true} disabled /></div>

  return (
    <>
      <div className="flex flex-col w-full max-w-md my-40 mx-auto p-6 gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg opacity-90 dark:opacity-95">
        <div className="flex items-center gap-4">
          <Avatar src={avatarUrl || user.avatarUrl} alt={name || user.name} size={20} isPro={user.plan === "plus"} />
          {isEditing ? (
            <form className="flex-1 flex flex-col gap-2" onSubmit={handleSaveChanges}>
              <Input id="name" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
              <Input id="avatarUrl" placeholder="URL do Avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} disabled={loading} />
            </form>
          ) : (
            <div className="flex-1 flex flex-col gap-1">
              <h2 className="text-xl font-bold text-lightFg-primary dark:text-darkFg-primary truncate">{user.name}</h2>
              <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary truncate">{user.email || "E-mail não fornecido"}</p>
              <small className="text-xs text-lightFg-tertiary dark:text-darkFg-tertiary">Membro desde {new Date(user.createdAt).toLocaleDateString()}</small>
            </div>
          )}
        </div>
        <div className="flex w-full justify-between items-center border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-2">
          {isEditing
            ? (<>
              <div className="flex gap-2">
                <Button variant="secondary" size="icon" $rounded title="Cancelar" onClick={handleEditToggle} disabled={loading}><X size={16} /></Button>
                <Button variant="success" size="icon" $rounded title="Salvar" onClick={handleSaveChanges} loading={loading}><Check size={16} /></Button>
              </div>
              <div className="flex gap-2">
                {user?.githubId
                  ? (<Button onClick={handleGithubUnlink} variant="danger" size="icon" $rounded title="Desvincular do GitHub"><Github size={16} /></Button>)
                  : (<Button onClick={handleGithubConnect} type="button" variant="secondary" size="icon" $rounded title="Vincular com GitHub"><Github size={16} /></Button>)}
                <Button variant="danger" size="icon" $rounded title="Deletar Conta" onClick={handleDeleteAccount} loading={loading}><Trash size={16} /></Button>
              </div>
            </>)
            : (<>
              <div className="flex gap-2">
                {user?.githubUsername && (
                  <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" size="icon" $rounded title="Perfil no GitHub"><Github size={16} /></Button>
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="warning" size="icon" $rounded title="Editar" onClick={handleEditToggle}><Pencil size={16} /></Button>
                <Button variant="danger" size="icon" $rounded title="Sair" onClick={handleSignOut}><LogOut size={16} /></Button>
              </div>
            </>)
          }
        </div>
      </div>
    </>
  )
}

export default OwnProfile
