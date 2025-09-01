import { useState, memo, useEffect } from "react"
import { Save, X, ArrowLeft, Code, Share2 } from "lucide-react"

import { useNotification } from "../../../contexts/NotificationContext"

import Button from "../../Button"
import Input from "../../Input"
import IconPickerInput from "../../IconPickerInput"

const ToolForm = memo(({ tool, onSave, onBack, loading }) => {
  const [formData, setFormData] = useState({})
  const { notifyError } = useNotification()

  useEffect(() => {
    setFormData({
      name: tool?.name || "",
      title: tool?.title || "",
      description: tool?.description || "",
      Icon: tool?.Icon || "PocketKnife",
      published: tool?.published || false,
      method: tool?.httpConfig?.method || "GET",
      url: tool?.httpConfig?.url || "",
      parameters: JSON.stringify(tool?.parameters || { type: "object", properties: {}, required: [] }, null, 2),
      queryParams: JSON.stringify(tool?.httpConfig?.queryParams || {}, null, 2),
      headers: JSON.stringify(tool?.httpConfig?.headers || {}, null, 2),
      body: JSON.stringify(tool?.httpConfig?.body || {}, null, 2)
    })
  }, [tool])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      const toolData = {
        name: formData.name,
        description: formData.description,
        title: formData.title,
        Icon: formData.Icon,
        published: formData.published,
        parameters: JSON.parse(formData.parameters),
        httpConfig: {
          method: formData.method,
          url: formData.url,
          queryParams: JSON.parse(formData.queryParams),
          headers: JSON.parse(formData.headers),
          body: JSON.parse(formData.body)
        }
      }
      onSave(toolData)
    } catch (error) {
      notifyError("JSON inválido em um dos campos avançados. Por favor, verifique.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 h-full">
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="icon" $rounded onClick={onBack} title="Voltar para a lista">
          <ArrowLeft size={16} />
        </Button>
        <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary truncate">{tool ? `Editando: ${tool.name}` : "Criar Nova Ferramenta"}</h3>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-2">
        <div>
          <Input
            placeholder="Apelido da Ferramenta (ex: Buscar CEP)"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            disabled={loading}
          />
          <Input placeholder="Nome Técnico (ex: cepTool)" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} disabled={loading} />
          <IconPickerInput value={formData.Icon} onChange={(value) => handleChange("Icon", value)} disabled={loading} />
        </div>
        <div>
          <label className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Descrição para a IA</label>
          <textarea
            placeholder="Como e quando usar esta ferramenta..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full mt-1 h-24 p-2 rounded-md resize-y bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary"
            disabled={loading}
          />
        </div>
        <div>
          <label className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">Configuração HTTP</label>
          <div className="flex gap-2 mt-1">
            <select
              value={formData.method}
              onChange={(e) => handleChange("method", e.target.value)}
              className="rounded-full bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary p-2"
              disabled={loading}>
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <Input placeholder="URL Base da API (sem query params)" value={formData.url} onChange={(e) => handleChange("url", e.target.value)} disabled={loading} />
          </div>
        </div>
        <details className="bg-lightBg-primary dark:bg-darkBg-primary p-3 rounded-md">
          <summary className="cursor-pointer font-bold text-sm text-lightFg-secondary dark:text-darkFg-secondary">
            <Code size={16} className="inline mr-2" />
            Configurações Avançadas (JSON)
          </summary>
          <div className="flex flex-col gap-2 mt-2">
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Definição do Esquema da Ferramenta</label>
              <textarea
                placeholder={`{ "type": "object", "properties": {}, "required": [] }`}
                value={formData.parameters}
                onChange={(e) => handleChange("parameters", e.target.value)}
                className="w-full h-40 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Parâmetros de Query (JSON)</label>
              <textarea
                placeholder={`{ "static": "valor_fixo", "dynamic": "{{variable}}" }`}
                value={formData.queryParams}
                onChange={(e) => handleChange("queryParams", e.target.value)}
                className="w-full h-24 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Cabeçalho</label>
              <textarea
                placeholder={`{ "Content-Type": "application/json" }`}
                value={formData.headers}
                onChange={(e) => handleChange("headers", e.target.value)}
                className="w-full h-40 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">Corpo</label>
              <textarea
                placeholder={`{ "text": "Hello World" }`}
                value={formData.body}
                onChange={(e) => handleChange("body", e.target.value)}
                className="w-full h-40 p-2 mt-1 rounded-md resize-y font-mono text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary text-lightFg-primary dark:text-darkFg-primary"
              />
            </div>
          </div>
        </details>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-bLight dark:border-bDark">
        <label htmlFor="tool-published" className="flex items-center gap-2 cursor-pointer text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">
          <Share2 size={16} />
          Publicar na Loja
          <input
            id="tool-published"
            type="checkbox"
            checked={formData.published}
            onChange={(e) => handleChange("published", e.target.checked)}
            disabled={loading}
            className="w-4 h-4 rounded text-primary-base bg-lightBg-tertiary border-gray-300 focus:ring-primary-base dark:focus:ring-primary-base dark:ring-offset-darkBg-primary dark:bg-darkBg-tertiary dark:border-gray-600"
          />
        </label>
        <Button type="submit" variant="primary" $rounded loading={loading} disabled={loading || !formData.name || !formData.url}>
          {!loading && <Save size={16} className="mr-2" />} Salvar Ferramenta
        </Button>
      </div>
    </form>
  )
})

export default ToolForm
