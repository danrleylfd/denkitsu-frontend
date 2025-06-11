import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { MdEdit, MdDelete, MdCancel, MdCheck } from "react-icons/md"

import { useAuth } from "../contexts/AuthContext"
import { getUserAccount, editUserAccount, deleteUserAccount } from "../services/account"

import SideMenu from "../components/SideMenu"
import Input from "../components/Input"
import Button from "../components/Button"
import { MessageSuccess, MessageError } from "../components/Notifications"

const Profile = () => {
  const { userId } = useParams()
  const { user, signOut, updateUser } = useAuth()
  const userID = userId || user._id
  const [userData, setUserData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getUserAccount(userID)
        setUserData(data)
        setName(data.name)
        setAvatarUrl(data.avatarUrl)
      } catch (err) {
        setError("Falha ao carregar dados do perfil.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [user?._id])

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    setError(null)
    setMessage("")
    if (isEditing && userData) {
      setName(userData.name)
      setAvatarUrl(userData.avatarUrl)
    }
  }

  const handleSaveChanges = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage("")
    setLoading(true)
    try {
      if (!name || !avatarUrl) {
        setError("Nome e URL do avatar são obrigatórios.")
        return
      }
      const updatedUser = await editUserAccount({ name, avatarUrl: user.name !== name ? avatarUrl.replace(user.name, name) : avatarUrl })
      setUserData(updatedUser)
      updateUser(updatedUser)
      setIsEditing(false)
    } catch (err) {
      setError(err.response?.data?.error || "Falha ao atualizar perfil.")
    } finally {
      setTimeout(() => setMessage(""), 1500)
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
    setError(null)
    try {
      await deleteUserAccount()
      signOut()
      navigate("/")
      alert("Conta excluída com sucesso.")
    } catch (err) {
      setError(err.response?.data?.error || "Falha ao excluir conta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SideMenu ContentView={({ children }) => (
      <div className="flex flex-1 flex-col justify-center items-center p-2 gap-2 mx-auto h-screen bg-cover bg-[url('/background.jpg')] bg-brand-purple">
        {children}
      </div>
    )}>
      {loading && !userData && <div className="p-2"><Button variant="secondary" $rounded loading={loading} disabled /></div>}
      {error && <MessageError>{error}</MessageError>}
      {!loading && !error && (
        <div className="flex w-max h-max my-40 mx-auto p-4 gap-2 items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-[8rem_0.5rem_0.5rem_8rem] shadow-lg opacity-75 dark:opacity-90">
          <img
            src={avatarUrl || userData.avatarUrl}
            alt={name || userData.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-violet-500 shadow-md"
          />
          {userID === user._id && isEditing ? (
            <form className="flex-1 flex flex-col gap-6 items-center" onSubmit={(e) => e.preventDefault()}>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
              <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} disabled={loading} />
              {error && <MessageError>{error}</MessageError>}
              <div className="flex w-full gap-2 justify-between">
                <Button variant="secondary" size="icon" $rounded title="Cancelar" onClick={handleEditToggle} loading={loading}>
                  <MdCancel size={16}/>
                </Button>
                <Button variant="success" size="icon" $rounded title="Salvar" onClick={handleSaveChanges} loading={loading}>
                  <MdCheck size={16}/>
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex-1 flex flex-col gap-2">
              <h5 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{userData.name}</h5>
              <p className="text-zinc-600 dark:text-zinc-400">@{userData.email.split("@")[0]}</p>
              <small className="text-xs text-zinc-500 dark:text-zinc-400">Conta criada em {new Date(userData.createdAt).toLocaleString()}</small>
              <small className="text-xs text-zinc-500 dark:text-zinc-400">Conta editada em {new Date(userData.updatedAt).toLocaleString()}</small>
              { userID === user._id && (
                <>
                  <div className="flex w-full gap-2 justify-between">
                    <Button variant="warning" size="icon" $rounded title="Editar" onClick={handleEditToggle}>
                      <MdEdit size={16}/>
                    </Button>
                    <Button variant="danger" size="icon" $rounded title="Deletar Conta" onClick={handleDeleteAccount} loading={loading}>
                      <MdDelete size={16}/>
                    </Button>
                  </div>
                  {message && <MessageSuccess>{message}</MessageSuccess>}
                  {error && !isEditing && <MessageError>{error}</MessageError>}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </SideMenu>
  )
}

export default Profile
