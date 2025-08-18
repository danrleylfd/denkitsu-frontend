import { useState, useEffect, memo } from "react"
import { Shapes, Plus, Trash2, Save, X, BotMessageSquare, Wrench, Code } from "lucide-react"

import { useTools } from "../contexts/ToolContext"
import { useNotification } from "../contexts/NotificationContext"

import SideMenu from "../components/SideMenu"
import Paper from "../components/Paper"
import Button from "../components/Button"
import Input from "../components/Input"

// A sub-componente para o formulário de edição/criação
const ToolEditor = memo(({ tool, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({})
  const [activeTab, setActiveTab] = useState("general")
  const { notifyError } = useNotification()

  useEffect(() => {
    setFormData({
      name: tool?.name || "",
      description: tool?.description || "",
      method: tool?.httpConfig?.method || "GET",
      url: tool?.httpConfig?.url || "",
      parameters: JSON.stringify(tool?.parameters || { type: "object", properties: {} }, null, 2),
      headers: JSON.stringify(tool?.httpConfig?.headers || {}, null, 2),
      body: JSON.stringify(tool?.httpConfig?.body || {}, null, 2)
    })
    setActiveTab("general")
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
        parameters: JSON.parse(formData.parameters),
        httpConfig: {
          method: formData.method,
          url: formData.url,
          headers: JSON.parse(formData.headers),
          body: JSON.parse(formData.body),
        }
      }
      onSave(toolData)
    } catch (error) {
      notifyError("JSON inválido em um dos campos avançados. Por favor, verifique.")
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <>
            <Input placeholder="Nome da Ferramenta (ex: buscarCEP)" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} disabled={loading} />
            <textarea placeholder="Descrição para a IA entender como e quando usar esta ferramenta..." value={formData.description} onChange={(e) => handleChange("description", e.target.value)} className="w-full h-24 p-2 rounded-md resize-y bg-lightBg-tertiary dark:bg-darkBg-tertiary" disabled={loading} />
          </>
        )
      case "config":
        return (
          <div className="flex flex-col gap-4">
            <select value={formData.method} onChange={(e) => handleChange("method", e.target.value)} className="w-full rounded-full bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2" disabled={loading}>
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <Input placeholder="URL da API (use {{param}} para variáveis)" value={formData.url} onChange={(e) => handleChange("url", e.target.value)} disabled={loading} />
          </div>
        )
      case "advanced":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Parâmetros (JSON Schema)</label>
              <textarea value={formData.parameters} onChange={(e) => handleChange("parameters", e.target.value)} className="w-full h-40 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary" />
            </div>
            <div>
              <label className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Headers (JSON)</label>
              <textarea value={formData.headers} onChange={(e) => handleChange("headers", e.target.value)} className="w-full h-40 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary" />
            </div>
            <div>
              <label className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Body (JSON)</label>
              <textarea value={formData.body} onChange={(e) => handleChange("body", e.target.value)} className="w-full h-40 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary" />
            </div>
          </div>
        )
      default: return null
    }
  }

  return (
    <Paper className="flex-1 flex flex-col min-w-0">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xl truncate">{tool ? `Editando: ${tool.name}` : "Criar Nova Ferramenta"}</h3>
          <Button type="button" variant="secondary" $rounded onClick={onCancel}>
            <X size={16} className="mr-2" /> Fechar
          </Button>
        </div>

        <div className="border-b border-bLight dark:border-bDark flex flex-wrap">
          <button type="button" onClick={() => setActiveTab("general")} className={`p-2 font-bold ${activeTab === 'general' ? 'text-primary-base border-b-2 border-primary-base' : 'text-lightFg-secondary dark:text-darkFg-secondary'}`}><BotMessageSquare size={16} className="inline mr-2" />Geral</button>
          <button type="button" onClick={() => setActiveTab("config")} className={`p-2 font-bold ${activeTab === 'config' ? 'text-primary-base border-b-2 border-primary-base' : 'text-lightFg-secondary dark:text-darkFg-secondary'}`}><Wrench size={16} className="inline mr-2" />Configuração HTTP</button>
          <button type="button" onClick={() => setActiveTab("advanced")} className={`p-2 font-bold ${activeTab === 'advanced' ? 'text-primary-base border-b-2 border-primary-base' : 'text-lightFg-secondary dark:text-darkFg-secondary'}`}><Code size={16} className="inline mr-2" />Avançado</button>
        </div>

        <div className="flex-grow">
          {renderContent()}
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" $rounded loading={loading} disabled={loading || !formData.name || !formData.url}>
            {!loading && <Save size={16} className="mr-2" />} Salvar Ferramenta
          </Button>
        </div>
      </form>
    </Paper>
  )
})

const ToolList = memo(({ tools, selectedToolId, onSelect, onCreate, onDelete }) => (
  <Paper className="w-full md:w-80 lg:w-96 flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">Ferramentas</h2>
      <Button variant="primary" $rounded onClick={onCreate}>
        <Plus size={16} className="mr-2" /> Criar
      </Button>
    </div>
    <div className="flex-1 overflow-y-auto pr-2">
      {tools.length === 0 ? (
        <div className="text-center py-10">
          <Shapes size={48} className="mx-auto text-lightFg-tertiary dark:text-darkFg-tertiary" />
          <p className="mt-4 text-sm">Você ainda não criou nenhuma ferramenta.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {tools.map(tool => (
            <li key={tool._id}>
              <button
                onClick={() => onSelect(tool)}
                className={`w-full text-left p-3 rounded-md transition-colors flex justify-between items-center group ${selectedToolId === tool._id ? 'bg-primary-base/20' : 'hover:bg-lightBg-tertiary dark:hover:bg-darkBg-tertiary'}`}
              >
                <div>
                  <p className="font-bold">{tool.name}</p>
                  <p className="text-xs text-lightFg-secondary dark:text-darkFg-secondary truncate">{tool.description}</p>
                </div>
                {/* CORREÇÃO 2: Botão de exclusão restaurado */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="danger" size="icon" $rounded title="Excluir" onClick={(e) => { e.stopPropagation(); onDelete(tool) }}><Trash2 size={14} /></Button>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </Paper>
))

const WelcomePanel = () => (
  <Paper className="flex-1 flex flex-col items-center justify-center text-center">
    <Shapes size={64} className="text-primary-base/50" />
    <h3 className="mt-4 text-xl font-bold">Construtor de Ferramentas</h3>
    <p className="mt-2 max-w-sm text-lightFg-secondary dark:text-darkFg-secondary">
      Selecione uma ferramenta à esquerda para editar ou clique em "Criar" para configurar uma nova integração com qualquer API REST.
    </p>
  </Paper>
)

const ToolBuilder = () => {
  const { tools, loading, addTool, editTool, removeTool } = useTools()
  const { notifyError, notifyInfo } = useNotification()
  const [activeView, setActiveView] = useState("list")
  const [selectedTool, setSelectedTool] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleSaveNew = async (toolData) => {
    setFormLoading(true)
    try {
      const newTool = await addTool(toolData)
      notifyInfo("Ferramenta criada com sucesso!")
      setSelectedTool(newTool)
      setActiveView("edit")
    } catch (error) {
      notifyError(error.response?.data?.error?.message || "Falha ao criar ferramenta.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleSaveEdit = async (toolData) => {
    setFormLoading(true)
    try {
      await editTool(selectedTool._id, toolData)
      notifyInfo("Ferramenta atualizada com sucesso!")
      setActiveView("list")
      setSelectedTool(null)
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
        if (selectedTool?._id === tool._id) {
          setSelectedTool(null)
          setActiveView("list")
        }
      } catch (error) {
        notifyError(error.response?.data?.error?.message || "Falha ao excluir ferramenta.")
      }
    }
  }

  const handleSelectTool = (tool) => {
    setSelectedTool(tool)
    setActiveView("edit")
  }

  const handleCreateClick = () => {
    setSelectedTool(null)
    setActiveView("create")
  }

  const handleCancel = () => {
    setSelectedTool(null)
    setActiveView("list")
  }

  return (
    <SideMenu fixed className="bg-cover bg-brand-purple">
      {loading ? <Button variant="outline" loading disabled /> : (
        // CORREÇÃO 1: Fundo sólido e correto
        <div className="flex-1 flex gap-4 w-full h-full p-4 bg-lightBg-primary dark:bg-darkBg-primary">
          <ToolList
            tools={tools}
            selectedToolId={selectedTool?._id}
            onSelect={handleSelectTool}
            onCreate={handleCreateClick}
            onDelete={handleDelete}
          />
          {activeView === 'list' && <WelcomePanel />}
          {activeView === 'create' && <ToolEditor onSave={handleSaveNew} onCancel={handleCancel} loading={formLoading} />}
          {activeView === 'edit' && <ToolEditor tool={selectedTool} onSave={handleSaveEdit} onCancel={handleCancel} loading={formLoading} />}
        </div>
      )}
    </SideMenu>
  )
}

export default ToolBuilder
