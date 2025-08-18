import { useState } from "react"
import { Shapes, Plus, Trash2, Pencil, Save, X } from "lucide-react"
import { useTools } from "../contexts/ToolContext"
import { useNotification } from "../contexts/NotificationContext"
import SideMenu from "../components/SideMenu"
import Paper from "../components/Paper"
import Button from "../components/Button"
import Input from "../components/Input"

const ContentView = ({ children }) => (
  <main className="flex flex-1 flex-col p-2 gap-2 w-full h-dvh ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

const ToolForm = ({ tool, onSave, onCancel, loading }) => {
  const [name, setName] = useState(tool?.name || "")
  const [description, setDescription] = useState(tool?.description || "")
  const [url, setUrl] = useState(tool?.httpConfig?.url || "")
  const [method, setMethod] = useState(tool?.httpConfig?.method || "GET")
  const [parameters, setParameters] = useState(JSON.stringify(tool?.parameters || { type: "object", properties: {} }, null, 2))
  const [headers, setHeaders] = useState(JSON.stringify(tool?.httpConfig?.headers || {}, null, 2))
  const [body, setBody] = useState(JSON.stringify(tool?.httpConfig?.body || {}, null, 2))
  const { notifyError } = useNotification()

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      const toolData = {
        name,
        description,
        parameters: JSON.parse(parameters),
        httpConfig: {
          method,
          url,
          headers: JSON.parse(headers),
          body: JSON.parse(body)
        }
      }
      onSave(toolData)
    } catch (error) {
      notifyError("JSON inválido em um dos campos. Por favor, verifique.")
    }
  }

  return (
    <Paper>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h3 className="font-bold text-xl">{tool ? "Editar Ferramenta" : "Criar Nova Ferramenta"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Nome da Ferramenta (ex: buscarCEP)" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full rounded-full bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2" disabled={loading}>
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <Input placeholder="URL da API (use {{param}} para variáveis)" value={url} onChange={(e) => setUrl(e.target.value)} disabled={loading} />
        <textarea placeholder="Descrição para a IA..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-24 p-2 rounded-md resize-y bg-lightBg-tertiary dark:bg-darkBg-tertiary" disabled={loading} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <textarea placeholder="Parâmetros (JSON Schema)" value={parameters} onChange={(e) => setParameters(e.target.value)} className="w-full h-32 p-2 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary" />
          <textarea placeholder="Headers (JSON)" value={headers} onChange={(e) => setHeaders(e.target.value)} className="w-full h-32 p-2 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary" />
          <textarea placeholder="Body (JSON)" value={body} onChange={(e) => setBody(e.target.value)} className="w-full h-32 p-2 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary" />
        </div>
        <div className="flex justify-end gap-2">
          {onCancel && <Button variant="secondary" $rounded onClick={onCancel} disabled={loading}>Cancelar</Button>}
          <Button type="submit" variant="primary" $rounded loading={loading} disabled={loading || !name || !url}>
            {!loading && <Save size={16} className="mr-2" />} Salvar
          </Button>
        </div>
      </form>
    </Paper>
  )
}


const ToolBuilder = () => {
  const { tools, loading, addTool, editTool, removeTool } = useTools()
  const { notifyError, notifyInfo } = useNotification()
  const [isCreating, setIsCreating] = useState(false)
  const [editingTool, setEditingTool] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleSaveNew = async (toolData) => {
    setFormLoading(true)
    try {
      await addTool(toolData)
      notifyInfo("Ferramenta criada com sucesso!")
      setIsCreating(false)
    } catch (error) {
      notifyError(error.response?.data?.error?.message || "Falha ao criar ferramenta.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleSaveEdit = async (toolData) => {
    setFormLoading(true)
    try {
      await editTool(editingTool._id, toolData)
      notifyInfo("Ferramenta atualizada com sucesso!")
      setEditingTool(null)
    } catch (error) {
      notifyError(error.response?.data?.error?.message || "Falha ao atualizar ferramenta.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (tool) => {
    if (window.confirm(`Tem certeza que deseja excluir a ferramenta "${tool.name}"?`)) {
        try {
            await removeTool(tool._id)
            notifyInfo("Ferramenta excluída com sucesso!")
        } catch (error) {
            notifyError(error.response?.data?.error?.message || "Falha ao excluir ferramenta.")
        }
    }
  }

  if (loading) {
    return (
      <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
        <Button variant="outline" loading disabled />
      </SideMenu>
    )
  }

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      {editingTool ? (
        <ToolForm tool={editingTool} onSave={handleSaveEdit} onCancel={() => setEditingTool(null)} loading={formLoading} />
      ) : isCreating ? (
        <ToolForm onSave={handleSaveNew} onCancel={() => setIsCreating(false)} loading={formLoading} />
      ) : (
        <div className="flex flex-col gap-4">
          <Paper className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Minhas Ferramentas</h2>
            <Button variant="primary" $rounded onClick={() => setIsCreating(true)}>
              <Plus size={16} className="mr-2" /> Criar Ferramenta
            </Button>
          </Paper>
          {tools.length === 0 ? (
            <Paper className="text-center">
              <Shapes size={48} className="mx-auto text-lightFg-tertiary dark:text-darkFg-tertiary" />
              <p className="mt-4">Você ainda não criou nenhuma ferramenta.</p>
            </Paper>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map(tool => (
                <Paper key={tool._id} className="flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold truncate">{tool.name}</h4>
                    <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary h-10 overflow-hidden text-ellipsis">{tool.description}</p>
                    <p className="font-mono text-xs mt-2 p-2 bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded">
                      <span className="font-bold text-primary-base">{tool.httpConfig.method}</span> {tool.httpConfig.url}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="warning" size="icon" $rounded onClick={() => setEditingTool(tool)}><Pencil size={16} /></Button>
                    <Button variant="danger" size="icon" $rounded onClick={() => handleDelete(tool)}><Trash2 size={16} /></Button>
                  </div>
                </Paper>
              ))}
            </div>
          )}
        </div>
      )}
    </SideMenu>
  )
}

export default ToolBuilder
