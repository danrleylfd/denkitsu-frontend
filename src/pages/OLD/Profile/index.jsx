import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { MdEdit, MdDelete, MdSave, MdCancel, MdCheck } from "react-icons/md"

import { useAuth } from "../../contexts/AuthContext"
import { getUserAccount, editUserAccount, deleteUserAccount } from "../../services/account"

import SideMenu from "../../components/SideMenu"
import Input from "../../components/Input"
import Button from "../../components/Button"
import { MessageSuccess, MessageError } from "../../components/Notifications"

import { SideContentContainer, Avatar, ButtonGroup, Container, ProfileView, ProfileForm } from "./styles"

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
    <SideMenu ContentView={SideContentContainer}>
      {loading && !userData && <div style={{ padding: ".5rem" }}><Button $rounded loading={loading} disabled /></div>}
      {error && <MessageError>{error}</MessageError>}
      {!loading && !error && (
        <Container>
          <Avatar src={avatarUrl || userData.avatarUrl} alt={name || userData.name} />
          {userID === user._id && isEditing ? (
            <ProfileForm onSubmit={(e) => e.preventDefault()}>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
              <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} disabled={loading} />
              {error && <MessageError>{error}</MessageError>}
              <ButtonGroup>
                <Button variant="secondary" size="icon" $rounded title="Cancelar" onClick={handleEditToggle} loading={loading}>
                  <MdCancel size={16}/>
                </Button>
                <Button variant="success" size="icon" $rounded title="Salvar" onClick={handleSaveChanges} loading={loading}>
                  <MdCheck size={16}/>
                </Button>
              </ButtonGroup>
            </ProfileForm>
          ) : (
            <ProfileView>
              <h5>{userData.name}</h5>
              <p>@{userData.email.split("@")[0]}</p>
              <small>Conta criada em {new Date(userData.createdAt).toLocaleString()}</small>
              <small>Conta editada em {new Date(userData.updatedAt).toLocaleString()}</small>
              { userID === user._id && (
                <>
                  <ButtonGroup>
                    <Button variant="warning" size="icon" $rounded title="Editar" onClick={handleEditToggle}>
                      <MdEdit size={16}/>
                    </Button>
                    <Button variant="danger" size="icon" $rounded title="Deletar Conta" onClick={handleDeleteAccount} loading={loading}>
                      <MdDelete size={16}/>
                    </Button>
                  </ButtonGroup>
                  {message && <MessageSuccess>{message}</MessageSuccess>}
                  {error && !isEditing && <MessageError>{error}</MessageError>}
                </>
              )}
            </ProfileView>
          )}
        </Container>
      )}
    </SideMenu>
  )
}

export default Profile
