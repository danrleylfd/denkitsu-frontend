import { useState, useEffect, useCallback } from "react"
import { MdContentCopy, MdAdd, MdEdit, MdDelete, MdCancel, MdCheck } from "react-icons/md"

import { useAuth } from "../contexts/AuthContext"
import { getLinkersByUser, createLinker, deleteLinker, updateLinker } from "../services/linker"

import SideMenu from "../components/SideMenu"
import Input from "../components/Input"
import Button from "../components/Button"
import { MessageBase, MessageWarning, MessageError } from "../components/Notifications"
import PurpleLink from "../components/PurpleLink"

const ContentView = ({ children }) => (
  <main
    className="flex flex-col items-center p-2 gap-2 mx-auto min-h-screen w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto"
    data-oid="cuee79c">
    {children}
  </main>
)

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
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple" data-oid="tw2-x-l">
      <div
        className="bg-lightBg-secondary dark:bg-darkBg-secondary p-4 rounded-md w-full shadow-[6px_6px_16px_rgba(0,0,0,0.5)] opacity-75 dark:opacity-90"
        data-oid="g5ebd3l">
        <form onSubmit={handleCreateLink} className="flex flex-row items-center gap-2" data-oid="qzlw03m">
          <Input placeholder="Apelido" value={newLabel} onChange={(e) => setNewLabel(e.target.value.trim())} disabled={formLoading} data-oid="99nsnn2" />
          <Input placeholder="Link Original" value={newLink} onChange={(e) => setNewLink(e.target.value.trim())} disabled={formLoading} data-oid="m5gq4:5" />
          <Button type="submit" size="icon" $rounded title="Encurtar" loading={formLoading} disabled={!newLabel || !newLink} data-oid=".wcnvu7">
            {!formLoading && <MdAdd size={16} data-oid="i_i:otp" />}
          </Button>
          {formError && <MessageError data-oid="bw_70fg">{formError}</MessageError>}
        </form>
      </div>
      {loading && <Button variant="outline" $rounded loading={loading} disabled data-oid="qe9jxxi" />}
      {message && <MessageBase data-oid="112he-1">{message}</MessageBase>}
      {error && <MessageError data-oid="t:_2ssa">{error}</MessageError>}
      {!loading && linkers.length === 0 && <MessageWarning data-oid="_fafua7">Você ainda não criou nenhum atalho.</MessageWarning>}
      {!loading && linkers.length > 0 && (
        <div className="flex flex-col gap-2 m-0 p-0 w-full" data-oid="xq1qyzn">
          {linkers.map((linker) => (
            <div
              key={linker._id}
              className="flex justify-between items-center p-4 rounded-md bg-lightBg-secondary dark:bg-darkBg-secondary shadow-[6px_6px_16px_rgba(0,0,0,0.5)] w-full opacity-75 dark:opacity-90"
              data-oid="73.co_j">
              {editingLinker?._id === linker._id ? (
                <form onSubmit={handleUpdateLink} className="flex flex-row items-center gap-2 w-full" data-oid="72i4vqh">
                  <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value.trim())} disabled={editLoading} data-oid="imc51c7" />
                  <Input value={editLink} onChange={(e) => setEditLink(e.target.value.trim())} disabled={editLoading} data-oid="3nbe-zx" />
                  <div className="flex gap-2" data-oid="2h11eb.">
                    <Button variant="secondary" size="icon" $rounded title="Cancelar" onClick={cancelEditing} disabled={editLoading} data-oid=".e-kmt:">
                      <MdCancel size={16} data-oid="qztiqm0" />
                    </Button>
                    <Button
                      type="submit"
                      variant="success"
                      size="icon"
                      $rounded
                      title="Salvar"
                      loading={editLoading}
                      disabled={!editLabel || !editLink}
                      data-oid="-monrgx">
                      {!editLoading && <MdCheck size={16} data-oid="-5h:.kh" />}
                    </Button>
                  </div>
                  {editError && (
                    <MessageError className="text-left mt-1" data-oid="4miw6w0">
                      {editError}
                    </MessageError>
                  )}
                </form>
              ) : (
                <>
                  <div className="flex gap-2" data-oid="u4l-ax7">
                    <PurpleLink to={`/access/${linker.label}`} target="_blank" rel="noopener noreferrer" data-oid="fgs5dgy">
                      Acessar /{linker.label}
                    </PurpleLink>
                  </div>
                  <div className="flex gap-2" data-oid="k5yabtd">
                    <Button
                      variant="success"
                      size="icon"
                      $rounded
                      title="Copiar"
                      onClick={() => copyToClipboard(`${window.origin}/access/${linker.label}`)}
                      data-oid="ly_3iyn">
                      <MdContentCopy size={16} data-oid="s6hyaep" />
                    </Button>
                    <Button variant="warning" size="icon" $rounded title="Editar" onClick={() => startEditing(linker)} data-oid="_1:cjzq">
                      <MdEdit size={16} data-oid="sxo8fa3" />
                    </Button>
                    <Button variant="danger" size="icon" $rounded title="Deletar" onClick={() => handleDeleteLink(linker.label)} data-oid="9m1org.">
                      <MdDelete size={16} data-oid="k_12_ly" />
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
