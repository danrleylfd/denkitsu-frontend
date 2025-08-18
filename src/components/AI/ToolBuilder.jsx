import { useState, useEffect, memo } from "react"
import { Shapes, Plus, Trash2, Pencil, Save, X, ArrowLeft, Code } from "lucide-react"

import { useTools } from "../../contexts/ToolContext"
import { useNotification } from "../../contexts/NotificationContext"

import Button from "../Button"
import Input from "../Input"

const ToolForm = memo(({ tool, onSave, onBack, loading }) => {
  const [formData, setFormData] = useState({})
  const { notifyError } = useNotification()

  useEffect(() => {
    setFormData({
      name: tool?.name || "",
      description: tool?.description || "",
      alias: tool?.alias || "",
      method: tool?.httpConfig?.method || "GET",
      url: tool?.httpConfig?.url || "",
      parameters: JSON.stringify(tool?.parameters || { type: "object", properties: {} }, null, 2),
      queryParams: JSON.stringify(tool?.httpConfig?.queryParams || {}, null, 2),
      headers: JSON.stringify(tool?.httpConfig?.headers || {}, null, 2),
      body: JSON.stringify(tool?.httpConfig?.body || {}, null, 2)
    })
  }, [tool])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      const toolData = {
        name: formData.name,
        description: formData.description,
        alias: formData.alias,
        parameters: JSON.parse(formData.parameters),
        httpConfig: {
          method: formData.method,
          url: formData.url,
          queryParams: JSON.parse(formData.queryParams),
          headers: JSON.parse(formData.headers),
          body: JSON.parse(formData.body),
        }
      }
      onSave(toolData)
    } catch (error) {
      notifyError("JSON inválido em um dos campos avançados. Por favor, verifique.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="icon" $rounded onClick={onBack} title="Voltar para a lista">
          <ArrowLeft size={16} />
        </Button>
        <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary truncate">{tool ? `Editando: ${tool.name}` : "Criar Nova Ferramenta"}</h3>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4">
        <div>
          <Input placeholder="Apelido da Ferramenta (ex: Buscar CEP)" value={formData.alias} onChange={(e) => handleChange("alias", e.target.value)} disabled={loading} />
          <Input placeholder="Nome Técnico (ex: cepTool)" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} disabled={loading} />
        </div>
        <div>
          <label className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Descrição para a IA</label>
          <textarea placeholder="Como e quando usar esta ferramenta..." value={formData.description} onChange={(e) => handleChange("description", e.target.value)} className="w-full mt-1 h-24 p-2 rounded-md resize-y bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" disabled={loading} />
        </div>
        <div>
          <label className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Configuração HTTP</label>
          <div className="flex gap-2 mt-1">
            <select value={formData.method} onChange={(e) => handleChange("method", e.target.value)} className="rounded-full bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary p-2" disabled={loading}>
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <Input placeholder="URL Base da API (sem query params)" value={formData.url} onChange={(e) => handleChange("url", e.target.value)} disabled={loading} />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Parâmetros de Query (JSON)</label>
          <textarea placeholder={`{ "apiKey": "valor_fixo", "cidade": "{{nome_da_cidade}}" }`} value={formData.queryParams} onChange={(e) => handleChange("queryParams", e.target.value)} className="w-full h-24 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" />
        </div>

        <details className="bg-lightBg-secondary/50 dark:bg-darkBg-secondary/50 p-3 rounded-md">
          <summary className="cursor-pointer font-bold text-sm text-lightFg-secondary dark:text-darkFg-secondary">
            <Code size={16} className="inline mr-2" />
            Configurações Avançadas (JSON)
          </summary>
          <div className="flex flex-col gap-4 mt-2">
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Definição do Esquema da Ferramenta</label>
              <textarea value={formData.parameters} onChange={(e) => handleChange("parameters", e.target.value)} className="w-full h-40 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Cabeçalho</label>
              <textarea value={formData.headers} onChange={(e) => handleChange("headers", e.target.value)} className="w-full h-40 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Corpo</label>
              <textarea value={formData.body} onChange={(e) => handleChange("body", e.target.value)} className="w-full h-40 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary" />
            </div>
          </div>
        </details>
      </div>

      <div className="flex justify-end pt-4 border-t border-bLight dark:border-bDark">
        <Button type="submit" variant="primary" $rounded loading={loading} disabled={loading || !formData.name || !formData.url}>
          {!loading && <Save size={16} className="mr-2" />} Salvar Ferramenta
        </Button>
      </div>
    </form>
  )
})

const ToolList = memo(({ tools, onCreate, onEdit, onDelete, toggleToolBuilderDoor }) => (
  <div className="flex flex-col h-full">
    <div className="flex justify-between items-center pb-4 border-b border-bLight dark:border-bDark">
      <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary">Minhas Ferramentas</h3>
      <Button variant="danger" size="icon" $rounded onClick={toggleToolBuilderDoor}><X size={16} /></Button>
    </div>
    <div className="flex-1 overflow-y-auto py-4 pr-2">
      {tools.length === 0 ? (
        <div className="text-center py-10">
          <Shapes size={48} className="mx-auto text-lightFg-tertiary dark:text-darkFg-tertiary" />
          <p className="mt-4 text-sm text-lightFg-primary dark:text-darkFg-primary">Você ainda não criou nenhuma ferramenta.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tools.map(tool => (
            <li key={tool._id} className="group flex items-center justify-between p-3 rounded-md hover:bg-lightBg-secondary dark:hover:bg-darkBg-secondary">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lightFg-primary dark:text-darkFg-primary truncate">{tool.alias || tool.name}</p>
                <p className="text-xs text-lightFg-secondary dark:text-darkFg-secondary truncate">{tool.description}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 pl-2">
                <Button variant="warning" size="icon" $rounded title="Editar" onClick={() => onEdit(tool)}><Pencil size={14} /></Button>
                <Button variant="danger" size="icon" $rounded title="Excluir" onClick={() => onDelete(tool)}><Trash2 size={14} /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    <div className="pt-4 border-t border-bLight dark:border-bDark">
      <Button variant="primary" $rounded onClick={onCreate} className="w-full justify-center">
        <Plus size={16} className="mr-2" /> Criar Nova Ferramenta
      </Button>
    </div>
  </div>
))

const AIToolBuilder = ({ toolBuilderDoor, toggleToolBuilderDoor }) => {
  if (!toolBuilderDoor) return null

  const { tools, loading, addTool, editTool, removeTool } = useTools()
  const { notifyError, notifyInfo } = useNotification()
  const [view, setView] = useState("list")
  const [currentTool, setCurrentTool] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleSave = async (toolData) => {
    setFormLoading(true)
    try {
      if (currentTool) {
        await editTool(currentTool._id, toolData)
        notifyInfo("Ferramenta atualizada com sucesso!")
      } else {
        await addTool(toolData)
        notifyInfo("Ferramenta criada com sucesso!")
      }
      setView("list")
      setCurrentTool(null)
    } catch (error) {
      notifyError(error.response?.data?.error?.message || "Falha ao salvar ferramenta.")
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

  const handleEdit = (tool) => {
    setCurrentTool(tool)
    setView("form")
  }

  const handleCreate = () => {
    setCurrentTool(null)
    setView("form")
  }

  const handleBack = () => {
    setCurrentTool(null)
    setView("list")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative flex w-full max-w-xl h-[90vh] flex-col gap-2 rounded-lg bg-lightBg-primary p-4 shadow-2xl dark:bg-darkBg-primary"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? <Button variant="outline" loading disabled /> : (
          view === 'list'
            ? <ToolList tools={tools} onCreate={handleCreate} onEdit={handleEdit} onDelete={handleDelete} toggleToolBuilderDoor={toggleToolBuilderDoor} />
            : <ToolForm tool={currentTool} onSave={handleSave} onBack={handleBack} loading={formLoading} />
        )}
      </div>
    </div>
  )
}

export default AIToolBuilder
