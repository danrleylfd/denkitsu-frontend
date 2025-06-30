import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { MdEdit, MdDelete, MdCancel, MdCheck } from "react-icons/md"

import { useAuth } from "../contexts/AuthContext"
import { useAI } from "../contexts/AIContext"
import { getUserAccount, editUserAccount, deleteUserAccount } from "../services/account"

import SideMenu from "../components/SideMenu"
import Input from "../components/Input"
import Button from "../components/Button"
import { MessageSuccess, MessageError } from "../components/Notifications"

const ContentView = ({ children }) => (
  <main className="flex justify-center items-center p-2 gap-2 min-h-screen w-full" data-oid="cxlnbwb">
    {children}
  </main>
)

const Profile = () => {
  const { userId } = useParams()
  const { aiKey, setAIKey } = useAI()
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
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple" data-oid="z8c0bg6">
      {loading && !userData && (
        <div className="p-2" data-oid="3kp7y43">
          <Button variant="secondary" $rounded loading={loading} disabled data-oid="airllr7" />
        </div>
      )}
      {error && <MessageError data-oid="nxty5uk">{error}</MessageError>}
      {!loading && !error && (
        <div
          className="flex w-max h-max my-40 min-w-96 mx-auto p-4 gap-2 items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-[8rem_0.5rem_0.5rem_8rem] shadow-[6px_6px_16px_rgba(0,0,0,0.5)] opacity-75 dark:opacity-90"
          data-oid="tdxma5v">
          <img
            src={avatarUrl || userData.avatarUrl}
            alt={name || userData.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-violet-500"
            data-oid="vjsugwu"
          />

          {userID === user._id && isEditing ? (
            <form className="flex-1 flex flex-col gap-0 items-center" onSubmit={(e) => e.preventDefault()} data-oid="xcmi::a">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} data-oid="y6fuahj" />
              <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} disabled={loading} data-oid="39dei:b" />
              <Input id="aiKey" value={aiKey} onChange={(e) => setAIKey(e.target.value)} disabled={loading} data-oid="b6k6:o-" />
              {error && <MessageError data-oid="5svm0uf">{error}</MessageError>}
              <div className="flex w-full gap-2 justify-between" data-oid="566vn4g">
                <Button variant="secondary" size="icon" $rounded title="Cancelar" onClick={handleEditToggle} loading={loading} data-oid="dwipqie">
                  <MdCancel size={16} data-oid="6rj_jbu" />
                </Button>
                <Button variant="success" size="icon" $rounded title="Salvar" onClick={handleSaveChanges} loading={loading} data-oid="0ouk87b">
                  <MdCheck size={16} data-oid="giq7ig-" />
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex-1 flex flex-col gap-2" data-oid="lw.a:kl">
              <h5 className="text-lg font-bold text-lightFg-primary dark:text-darkFg-primary" data-oid="ga6h6.x">
                {userData.name}
              </h5>
              <p className="text-lightFg-secondary dark:text-darkFg-secondary" data-oid="-in_pu3">
                @{userData.email.split("@")[0]}
              </p>
              <small className="text-xs text-lightFg-secondary dark:text-darkFg-secondary" data-oid="36ah3j-">
                Conta criada em {new Date(userData.createdAt).toLocaleString()}
              </small>
              <small className="text-xs text-lightFg-secondary dark:text-darkFg-secondary" data-oid="awy2:u9">
                Conta editada em {new Date(userData.updatedAt).toLocaleString()}
              </small>
              {userID === user._id && (
                <div className="flex-1 flex flex-col gap-0 items-center" data-oid="miedu5s">
                  <div className="flex w-full gap-2 justify-between" data-oid="s9pigj1">
                    <Button variant="warning" size="icon" $rounded title="Editar" onClick={handleEditToggle} data-oid="o77511s">
                      <MdEdit size={16} data-oid="b:8y4oz" />
                    </Button>
                    <Button variant="danger" size="icon" $rounded title="Deletar Conta" onClick={handleDeleteAccount} loading={loading} data-oid="rbibimu">
                      <MdDelete size={16} data-oid="ga_c85g" />
                    </Button>
                  </div>
                  {message && <MessageSuccess data-oid="_i8fp6:">{message}</MessageSuccess>}
                  {error && !isEditing && <MessageError data-oid="ebgq9m1">{error}</MessageError>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </SideMenu>
  )
}

export default Profile
