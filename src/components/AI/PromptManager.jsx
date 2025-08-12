import { useState } from "react"
import { Plus, Edit, Trash2, X, Check } from "lucide-react"
import { useNotification } from "../../contexts/NotificationContext"
import { createPrompt, updatePrompt, deletePrompt } from "../../services/prompt"
import Button from "../Button"
import Input from "../Input"

const AIPromptManager = ({ prompts, setPrompts, onClose }) => {
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [loading, setLoading] = useState(false)
  const { notifyInfo, notifyError } = useNotification()

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setLoading(true)
    try {
      const created = await createPrompt({ title: newTitle, content: newContent })
      setPrompts(prev => [created, ...prev])
      setNewTitle("")
      setNewContent("")
      notifyInfo("Prompt criado!")
    } catch (err) {
      notifyError("Falha ao criar prompt.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingPrompt) return
    setLoading(true)
    try {
      const updated = await updatePrompt(editingPrompt._id, { title: editingPrompt.title, content: editingPrompt.content })
      setPrompts(prev => prev.map(p => p._id === updated._id ? updated : p))
      setEditingPrompt(null)
      notifyInfo("Prompt atualizado!")
    } catch (err) {
      notifyError("Falha ao atualizar prompt.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (promptId) => {
    if (!window.confirm("Tem certeza que deseja excluir este prompt?")) return
    setLoading(true)
    try {
      await deletePrompt(promptId)
      setPrompts(prev => prev.filter(p => p._id !== promptId))
      notifyInfo("Prompt excluído!")
    } catch (err) {
      notifyError("Falha ao excluir prompt.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative flex w-full max-w-2xl h-[80vh] flex-col gap-4 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lightFg-primary dark:text-darkFg-primary">Gerenciar Prompts</h3>
          <Button variant="danger" size="icon" $rounded onClick={onClose}><X size={16} /></Button>
        </div>

        {/* Formulário de Criação */}
        <div className="flex flex-col gap-2 p-2 border border-bLight dark:border-bDark rounded-md">
            <Input placeholder="Título do Novo Prompt" value={newTitle} onChange={e => setNewTitle(e.target.value)} disabled={loading} />
            <textarea placeholder="Conteúdo do Novo Prompt..." value={newContent} onChange={e => setNewContent(e.target.value)} disabled={loading} className="w-full h-24 p-2 rounded-md resize-y bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary" />
            <Button onClick={handleCreate} loading={loading} $rounded>
                <Plus size={16} className="mr-2"/> Criar Prompt
            </Button>
        </div>

        {/* Lista de Prompts */}
        <div className="flex-1 overflow-y-auto space-y-2">
            {prompts.map(prompt => (
                <div key={prompt._id} className="p-2 border border-bLight dark:border-bDark rounded-md">
                    {editingPrompt?._id === prompt._id ? (
                        <div className="flex flex-col gap-2">
                             <Input value={editingPrompt.title} onChange={e => setEditingPrompt({...editingPrompt, title: e.target.value})} disabled={loading} />
                             <textarea value={editingPrompt.content} onChange={e => setEditingPrompt({...editingPrompt, content: e.target.value})} disabled={loading} className="w-full h-24 p-2 rounded-md resize-y bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary" />
                             <div className="flex justify-end gap-2">
                                <Button variant="secondary" size="icon" $rounded onClick={() => setEditingPrompt(null)}><X size={16}/></Button>
                                <Button variant="success" size="icon" $rounded onClick={handleUpdate} loading={loading}><Check size={16}/></Button>
                             </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-bold">{prompt.title}</p>
                                <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary truncate">{prompt.content}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="warning" size="icon" $rounded onClick={() => setEditingPrompt(prompt)}><Edit size={16}/></Button>
                                <Button variant="danger" size="icon" $rounded onClick={() => handleDelete(prompt._id)}><Trash2 size={16}/></Button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default AIPromptManager
