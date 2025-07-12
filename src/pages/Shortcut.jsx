import { useState, useEffect, useCallback } from "react"
import { Copy, Plus, Pencil, Trash, X, Check } from "lucide-react"

import { useAuth } from "../contexts/AuthContext"
import { getLinkersByUser, createLinker, deleteLinker, updateLinker } from "../services/linker"

import { useNotification } from "../contexts/NotificationContext"

import SideMenu from "../components/SideMenu"
import Input from "../components/Input"
import Button from "../components/Button"
import PurpleLink from "../components/Embeds/PurpleLink"

const ContentView = ({ children }) => (
  <main
    className="flex flex-col items-center p-2 gap-2 mx-auto min-h-screen w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

const Shortcut = () => {
  const { signed } = useAuth()
  const { notifyInfo, notifyError } = useNotification()
  const [linkers, setLinkers] = useState([])
  const [newLabel, setNewLabel] = useState("")
  const [newLink, setNewLink] = useState("")
  const [editingLinker, setEditingLinker] = useState(null)
  const [editLabel, setEditLabel] = useState("")
  const [editLink, setEditLink] = useState("")
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  const fetchLinkers = useCallback(async () => {
    if (!signed) return
    try {
      setLoading(true)
      const data = await getLinkersByUser()
      setLinkers(data || [])
    } catch (err) {
      console.error(err)
      notifyError("Falha ao carregar links encurtados.")
    } finally {
      setLoading(false)
    }
  }, [signed])

  useEffect(() => {
    fetchLinkers()
  }, [fetchLinkers])

  const handleCreateLink = async (e) => {
    e.preventDefault()
    if (!newLabel || !newLink) {
      notifyError("Por favor, preencha o Rótulo e o Link de destino.")
      return
    }
    setFormLoading(true)
    try {
      const created = await createLinker(newLabel, newLink)
      setLinkers([created, ...linkers])
      setNewLabel("")
      setNewLink("")
      notifyInfo("Link criado com sucesso!")
    } catch (err) {
      console.error(err)
      notifyError("Falha ao criar link. Verifique se o rótulo já existe.")
    } finally {
      setFormLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        notifyInfo(`Link ${text} copiado!`)
      },
      (err) => {
        console.error("Could not copy text: ", err)
        notifyError("Falha ao copiar link.")
      }
    )
  }

  const handleUpdateLink = async (e) => {
    e.preventDefault()
    if (!editingLinker) return
    setEditLoading(true)
    try {
      const updated = await updateLinker(editingLinker.label, editLabel, editLink)
      setLinkers(linkers.map((l) => (l._id === updated._id ? updated : l)))
      notifyInfo("Link atualizado com sucesso!")
      cancelEditing()
    } catch (err) {
      console.error(err)
      notifyError("Falha ao atualizar link. Verifique se o novo rótulo já existe.")
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteLink = async (labelToDelete) => {
    if (!window.confirm(`Tem certeza que deseja excluir o link com rótulo "${labelToDelete}"?`)) return
    try {
      await deleteLinker(labelToDelete)
      setLinkers(linkers.filter((linker) => linker.label !== labelToDelete))
      notifyInfo("Link excluído com sucesso!")
    } catch (err) {
      console.error(err)
      notifyError("Falha ao excluir link.")
    }
  }

  const startEditing = (linker) => {
    setEditingLinker(linker)
    setEditLabel(linker.label)
    setEditLink(linker.link)
  }

  const cancelEditing = () => {
    setEditingLinker(null)
    setEditLabel("")
    setEditLink("")
  }

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <div
        className="bg-lightBg-secondary dark:bg-darkBg-secondary p-4 rounded-md w-full shadow-[6px_6px_16px_rgba(0,0,0,0.5)] opacity-75 dark:opacity-90">
        <form onSubmit={handleCreateLink} className="flex flex-row items-center gap-2">
          <Input placeholder="Apelido" value={newLabel} onChange={(e) => setNewLabel(e.target.value.trim())} disabled={formLoading} />
          <Input placeholder="Link Original" value={newLink} onChange={(e) => setNewLink(e.target.value.trim())} disabled={formLoading} />
          <Button type="submit" size="icon" $rounded title="Encurtar" loading={formLoading} disabled={!newLabel || !newLink}>
            {!formLoading && <Plus size={16} />}
          </Button>
        </form>
      </div>
      {loading && <Button variant="outline" $rounded loading={loading} disabled />}
      {!loading && linkers.length > 0 && (
        <div className="flex flex-col gap-2 m-0 p-0 w-full">
          {linkers.map((linker) => (
            <div
              key={linker._id}
              className="flex justify-between items-center p-4 rounded-md bg-lightBg-secondary dark:bg-darkBg-secondary shadow-[6px_6px_16px_rgba(0,0,0,0.5)] w-full opacity-75 dark:opacity-90">
              {editingLinker?._id === linker._id ? (
                <form onSubmit={handleUpdateLink} className="flex flex-row items-center gap-2 w-full">
                  <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value.trim())} disabled={editLoading} />
                  <Input value={editLink} onChange={(e) => setEditLink(e.target.value.trim())} disabled={editLoading} />
                  <div className="flex gap-2">
                    <Button variant="secondary" size="icon" $rounded title="Cancelar" onClick={cancelEditing} disabled={editLoading}>
                      <X size={16} />
                    </Button>
                    <Button
                      type="submit"
                      variant="success"
                      size="icon"
                      $rounded
                      title="Salvar"
                      loading={editLoading}
                      disabled={!editLabel || !editLink}>
                      {!editLoading && <Check size={16} />}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex gap-2">
                    <PurpleLink to={`/access/${linker.label}`} target="_blank" rel="noopener noreferrer">
                      Acessar /{linker.label}
                    </PurpleLink>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="success"
                      size="icon"
                      $rounded
                      title="Copiar"
                      onClick={() => copyToClipboard(`${window.origin}/access/${linker.label}`)}>
                      <Copy size={16} />
                    </Button>
                    <Button variant="warning" size="icon" $rounded title="Editar" onClick={() => startEditing(linker)}>
                      <Pencil size={16} />
                    </Button>
                    <Button variant="danger" size="icon" $rounded title="Deletar" onClick={() => handleDeleteLink(linker.label)}>
                      <Trash size={16} />
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
