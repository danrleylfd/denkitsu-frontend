import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { MdContentCopy, MdAdd, MdEdit, MdDelete, MdCancel, MdCheck } from "react-icons/md"

import { useAuth } from "../contexts/AuthContext"
import { getLinkersByUser, createLinker, deleteLinker, updateLinker } from "../services/linker"

import SideMenu from "../components/SideMenu"
import Input from "../components/Input"
import Button from "../components/Button"
import { MessageBase, MessageWarning, MessageError } from "../components/Notifications"

const Shortcut = () => {
  const { signed } = useAuth()
  const [linkers, setLinkers] = useState([])
  const [newLabel, setNewLabel] = useState("")
  const [newLink, setNewLink] = useState("")
  const [editingLinker, setEditingLinker] = useState(null)
  const [editLabel, setEditLabel] = useState("")
  const [editLink, setEditLink] = useState("")
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState("")
  const [editError, setEditError] = useState("")
  const [message, setMessage] = useState("")

  const fetchLinkers = useCallback(async () => {
    if (!signed) return
    try {
      setLoading(true)
      setError(null)
      const data = await getLinkersByUser()
      setLinkers(data || [])
    } catch (err) {
      setError("Falha ao carregar links encurtados.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [signed])

  useEffect(() => {
    fetchLinkers()
  }, [fetchLinkers])

  const handleCreateLink = async (e) => {
    e.preventDefault()
    setFormError("")
    setMessage("")
    if (!newLabel || !newLink) {
      setFormError("Por favor, preencha o Rótulo e o Link de destino.")
      return
    }
    setFormLoading(true)
    try {
      const created = await createLinker(newLabel, newLink)
      setLinkers([created, ...linkers])
      setNewLabel("")
      setNewLink("")
      setMessage("Link criado com sucesso!")
    } catch (err) {
      setFormError(err.response?.data?.message || "Falha ao criar link. Verifique se o rótulo já existe.")
    } finally {
      setFormLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setMessage(`Link ${text} copiado!`)
        setTimeout(() => setMessage(""), 3000)
      },
      (err) => {
        console.error("Could not copy text: ", err)
        setError("Falha ao copiar link.")
      }
    )
  }

  const handleUpdateLink = async (e) => {
    e.preventDefault()
    if (!editingLinker) return
    setEditError("")
    if (!editLabel || !editLink) {
      setEditError("Rótulo e Link não podem estar vazios.")
      return
    }
    setEditLoading(true)
    try {
      const updated = await updateLinker(editingLinker.label, editLabel, editLink)
      setLinkers(linkers.map((l) => (l._id === updated._id ? updated : l)))
      setMessage("Link atualizado com sucesso!")
      cancelEditing()
    } catch (err) {
      setEditError(err.response?.data?.message || "Falha ao atualizar link. Verifique se o novo rótulo já existe.")
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteLink = async (labelToDelete) => {
    if (!window.confirm(`Tem certeza que deseja excluir o link com rótulo "${labelToDelete}"?`)) return
    try {
      await deleteLinker(labelToDelete)
      setLinkers(linkers.filter((linker) => linker.label !== labelToDelete))
      setMessage("Link excluído com sucesso!")
    } catch (err) {
      setError(err.response?.data?.message || "Falha ao excluir link.")
    }
  }

  const startEditing = (linker) => {
    setEditingLinker(linker)
    setEditLabel(linker.label)
    setEditLink(linker.link)
    setEditError("")
  }

  const cancelEditing = () => {
    setEditingLinker(null)
    setEditLabel("")
    setEditLink("")
    setEditError("")
  }

  return (
    <SideMenu fixed className="bg-no-repeat bg-contain bg-[url('/background.jpg')] bg-brand-purple">
      <div className="bg-light-cardBg dark:bg-dark-cardBg p-4 rounded-md w-full opacity-75 dark:opacity-90">
        <form onSubmit={handleCreateLink} className="flex flex-row items-center gap-2">
          <Input placeholder="Apelido" value={newLabel} onChange={(e) => setNewLabel(e.target.value.trim())} disabled={formLoading} />
          <Input placeholder="Link Original" value={newLink} onChange={(e) => setNewLink(e.target.value.trim())} disabled={formLoading} />
          <Button type="submit" size="icon" $rounded title="Encurtar" loading={formLoading} disabled={!newLabel || !newLink}>
            {!formLoading && <MdAdd size={16} />}
          </Button>
          {formError && <MessageError>{formError}</MessageError>}
        </form>
      </div>
      {loading && <Button variant="outline" $rounded loading={loading} disabled />}
      {message && <MessageBase>{message}</MessageBase>}
      {error && <MessageError>{error}</MessageError>}
      {!loading && linkers.length === 0 && <MessageWarning>Você ainda não criou nenhum atalho.</MessageWarning>}
      {!loading && linkers.length > 0 && (
        <div className="flex flex-col gap-2 m-0 p-0 w-full">
          {linkers.map((linker) => (
            <div
              key={linker._id}
              className="flex justify-between items-center p-4 rounded-md border bg-light-cardBg dark:bg-dark-cardBg border-light-border dark:border-dark-border w-full opacity-75 dark:opacity-90">
              {editingLinker?._id === linker._id ? (
                <form onSubmit={handleUpdateLink} className="flex flex-row items-center gap-2 w-full">
                  <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value.trim())} disabled={editLoading} />
                  <Input value={editLink} onChange={(e) => setEditLink(e.target.value.trim())} disabled={editLoading} />
                  <div className="flex gap-2">
                    <Button variant="secondary" size="icon" $rounded title="Cancelar" onClick={cancelEditing} disabled={editLoading}>
                      <MdCancel size={16} />
                    </Button>
                    <Button type="submit" variant="success" size="icon" $rounded title="Salvar" loading={editLoading} disabled={!editLabel || !editLink}>
                      {!editLoading && <MdCheck size={16} />}
                    </Button>
                  </div>
                  {editError && <MessageError className="text-left mt-1">{editError}</MessageError>}
                </form>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Link to={`/access/${linker.label}`} target="_blank" rel="noopener noreferrer">
                      Acessar /{linker.label}
                    </Link>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="success" size="icon" $rounded title="Copiar" onClick={() => copyToClipboard(`${window.origin}/access/${linker.label}`)}>
                      <MdContentCopy size={16} />
                    </Button>
                    <Button variant="warning" size="icon" $rounded title="Editar" onClick={() => startEditing(linker)}>
                      <MdEdit size={16} />
                    </Button>
                    <Button variant="danger" size="icon" $rounded title="Deletar" onClick={() => handleDeleteLink(linker.label)}>
                      <MdDelete size={16} />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </SideMenu>
  )
}

export default Shortcut
