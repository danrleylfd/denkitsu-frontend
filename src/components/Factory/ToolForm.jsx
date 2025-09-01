import { useState, memo, useEffect } from "react"
import { Save, ArrowLeft, Code, Share2 } from "lucide-react"

import { useNotification } from "../../contexts/NotificationContext"

import Button from "../Button"
import Input from "../Input"
import IconPickerInput from "../IconPickerInput"

const ToolForm = memo(({ tool, onSave, onBack, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    Icon: "PocketKnife",
    published: false,
    method: "GET",
    url: "",
    parameters: "{}",
    queryParams: "{}",
    headers: "{}",
    body: "{}"
  })
  const { notifyError } = useNotification()

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name || "",
        title: tool.title || "",
        description: tool.description || "",
        Icon: tool.Icon || "PocketKnife",
        published: tool.published || false,
        method: tool.httpConfig?.method || "GET",
        url: tool.httpConfig?.url || "",
        parameters: JSON.stringify(tool.parameters || { type: "object", properties: {}, required: [] }, null, 2),
        queryParams: JSON.stringify(tool.httpConfig?.queryParams || {}, null, 2),
        headers: JSON.stringify(tool.httpConfig?.headers || {}, null, 2),
        body: JSON.stringify(tool.httpConfig?.body || {}, null, 2)
      })
    }
  }, [tool])

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }))
  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      onSave({
        ...formData,
        parameters: JSON.parse(formData.parameters),
        httpConfig: {
          method: formData.method,
          url: formData.url,
          queryParams: JSON.parse(formData.queryParams),
          headers: JSON.parse(formData.headers),
          body: JSON.parse(formData.body)
        }
      })
    } catch (error) {
      notifyError("JSON inválido em um dos campos. Por favor, verifique.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex items-center gap-2 flex-shrink-0 mb-2">
        <Button variant="secondary" size="icon" $rounded onClick={onBack} title="Voltar para a lista">
          <ArrowLeft size={16} />
        </Button>
        <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary truncate">{tool._id ? `Editando: ${tool.name}` : "Criar Nova Ferramenta"}</h3>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4 font-mono text-sm">
        <div className="flex flex-col gap-2 p-3 rounded-md bg-lightBg-tertiary dark:bg-darkBg-tertiary">
          <div className="flex items-center gap-2">
            <label className="text-lightFg-tertiary dark:text-darkFg-tertiary">title:</label>
            <Input
              containerClassName="my-0"
              className="font-mono text-sm"
              placeholder="Apelido da Ferramenta"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-lightFg-tertiary dark:text-darkFg-tertiary">name:</label>
            <Input
              containerClassName="my-0"
              className="font-mono text-sm"
              placeholder="nomeTecnicoDaTool"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={loading}
            />
          </div>
          <IconPickerInput value={formData.Icon} onChange={(value) => handleChange("Icon", value)} disabled={loading} />
          <div className="flex items-start gap-2">
            <label className="text-lightFg-tertiary dark:text-darkFg-tertiary pt-2">description:</label>
            <textarea
              placeholder="Descrição para a IA sobre como e quando usar a ferramenta..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full flex-1 h-20 p-2 rounded-md resize-y font-mono text-sm bg-lightBg-primary dark:bg-darkBg-primary focus:outline-primary-base"
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 p-3 rounded-md bg-lightBg-tertiary dark:bg-darkBg-tertiary">
          <label className="text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">http:</label>
          <div className="flex gap-2 mt-1 items-center">
            <select
              value={formData.method}
              onChange={(e) => handleChange("method", e.target.value)}
              className="rounded-full bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary p-2 font-mono text-sm"
              disabled={loading}>
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <Input
              containerClassName="my-0"
              className="font-mono text-sm"
              placeholder="https://api.example.com/data"
              value={formData.url}
              onChange={(e) => handleChange("url", e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        <details className="p-3 rounded-md bg-lightBg-tertiary dark:bg-darkBg-tertiary" open>
          <summary className="cursor-pointer font-bold text-sm text-lightFg-secondary dark:text-darkFg-secondary">
            <Code size={16} className="inline mr-2" />
            advanced (JSON):
          </summary>
          <div className="flex flex-col gap-2 mt-2 pl-4 border-l border-bLight dark:border-bDark">
            <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">parameters:</label>
            <textarea
              value={formData.parameters}
              onChange={(e) => handleChange("parameters", e.target.value)}
              className="w-full h-24 p-2 rounded-md resize-y font-mono text-sm bg-lightBg-primary dark:bg-darkBg-primary focus:outline-primary-base"
            />
            <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">queryParams:</label>
            <textarea
              value={formData.queryParams}
              onChange={(e) => handleChange("queryParams", e.target.value)}
              className="w-full h-24 p-2 rounded-md resize-y font-mono text-sm bg-lightBg-primary dark:bg-darkBg-primary focus:outline-primary-base"
            />
            <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">headers:</label>
            <textarea
              value={formData.headers}
              onChange={(e) => handleChange("headers", e.target.value)}
              className="w-full h-24 p-2 rounded-md resize-y font-mono text-sm bg-lightBg-primary dark:bg-darkBg-primary focus:outline-primary-base"
            />
            <label className="text-xs font-bold text-lightFg-tertiary dark:text-darkFg-tertiary">body:</label>
            <textarea
              value={formData.body}
              onChange={(e) => handleChange("body", e.target.value)}
              className="w-full h-24 p-2 rounded-md resize-y font-mono text-sm bg-lightBg-primary dark:bg-darkBg-primary focus:outline-primary-base"
            />
          </div>
        </details>
      </div>
      <div className="flex justify-between items-center pt-2 mt-2 border-t border-bLight dark:border-bDark flex-shrink-0">
        <label htmlFor="tool-published" className="flex items-center gap-2 cursor-pointer text-sm font-bold text-lightFg-secondary dark:text-darkFg-secondary">
          <Share2 size={16} /> Publicar
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
          <Save size={16} className="mr-2" /> Salvar
        </Button>
      </div>
    </form>
  )
})

export default ToolForm
