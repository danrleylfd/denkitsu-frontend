import { useState, memo, useEffect } from "react"
import { Save, ArrowLeft, Share2, Play } from "lucide-react"
import axios from "axios"

import { useNotification } from "../../contexts/NotificationContext"

import Button from "../Button"
import Input from "../Input"
import IconPickerInput from "../IconPickerInput"
import TextArea from "../TextArea"

const resolveObjectPath = (obj, path) => {
  if (!path) return obj
  try {
    return path.split(".").reduce((prev, curr) => {
      const arrMatch = curr.match(/(\w+)\[(\d+)\]/)
      if (arrMatch) {
        const key = arrMatch[1]
        const index = parseInt(arrMatch[2], 10)
        return prev && prev[key] ? prev[key][index] : undefined
      }
      return prev ? prev[curr] : undefined
    }, obj)
  } catch (error) {
    return undefined
  }
}

const ToolForm = memo(({ tool, onSave, onBack, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    Icon: "PocketKnife",
    published: false,
    httpConfig: { method: "GET", url: "" },
    parameters: "{}",
    queryParams: "{}",
    headers: "{}",
    body: "{}",
    responseMapping: "data"
  })
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [mappingPreview, setMappingPreview] = useState(null)

  const { notifyError } = useNotification()

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name || "",
        title: tool.title || "",
        description: tool.description || "",
        Icon: tool.Icon || "PocketKnife",
        published: tool.published || false,
        httpConfig: {
          method: tool.httpConfig?.method || "GET",
          url: tool.httpConfig?.url || ""
        },
        parameters: JSON.stringify(tool.parameters || { type: "object", properties: {}, required: [] }, null, 2),
        queryParams: JSON.stringify(tool.httpConfig?.queryParams || {}, null, 2),
        headers: JSON.stringify(tool.httpConfig?.headers || {}, null, 2),
        body: JSON.stringify(tool.httpConfig?.body || {}, null, 2),
        responseMapping: tool.responseMapping || "data"
      })
    }
  }, [tool])

  useEffect(() => {
    if (testResult) {
      const mapped = resolveObjectPath(testResult, formData.responseMapping)
      setMappingPreview(mapped)
    }
  }, [testResult, formData.responseMapping])


  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }))
  const handleHttpChange = (field, value) => setFormData((prev) => ({ ...prev, httpConfig: { ...prev.httpConfig, [field]: value } }))

  const handleTestRequest = async () => {
    setIsTesting(true)
    setTestResult(null)
    setMappingPreview(null)
    try {
      const { url, method } = formData.httpConfig
      const headers = JSON.parse(formData.headers)
      const params = JSON.parse(formData.queryParams)
      const data = method !== "GET" ? JSON.parse(formData.body) : undefined

      const response = await axios({ url, method, headers, params, data })
      setTestResult(response.data)
    } catch (error) {
      const errorMessage = error.response ? JSON.stringify(error.response.data, null, 2) : error.message
      setTestResult({ error: "Falha na requisição de teste", details: errorMessage })
      notifyError("A requisição de teste falhou.")
    } finally {
      setIsTesting(false)
    }
  }


  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      const { parameters, queryParams, headers, body, httpConfig, ...rest } = formData
      const toolData = {
        ...rest,
        parameters: JSON.parse(parameters),
        httpConfig: {
          ...httpConfig,
          queryParams: JSON.parse(queryParams),
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
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="secondary" size="icon" $rounded onClick={onBack} title="Voltar">
          <ArrowLeft size={16} />
        </Button>
        <h5 className="text-lightFg-primary dark:text-darkFg-primary">
          {tool._id ? "Editar Ferramenta" : "Fabricar Ferramenta"}
        </h5>
      </div>
      <div className="overflow-y-auto flex flex-col">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-lightFg-secondary dark:text-darkFg-secondary">Alias / Icon (Apelido / Ícone)</label>
          <Input placeholder="ApelidoDaFerramenta" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} disabled={loading} maxLength="32">
            <IconPickerInput value={formData.Icon} onChange={(value) => handleChange("Icon", value)} disabled={loading} />
          </Input>
          <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end pr-2">{formData.title.length} / 32</small>
          <label className="text-xs font-bold text-lightFg-secondary dark:text-darkFg-secondary">Tool Name (Nome da Ferramenta)</label>
          <Input placeholder="NomeTécnicoDaTool" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} disabled={loading} maxLength="32" />
          <small className="text-right text-xs text-lightFg-tertiary dark:text-darkFg-tertiary self-end pr-2">{formData.name.length} / 32</small>
          <TextArea
            label="Description (Descrição)"
            placeholder="Descrição para a IA sobre como e quando usar a ferramenta..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={loading}
            maxLength={256}
            rows={3}
          />

          <label className="text-xs font-bold text-lightFg-secondary dark:text-darkFg-secondary mt-2">URL / Method (URL / Método HTTP)</label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="https://api.example.com/data"
              value={formData.httpConfig.url}
              onChange={(e) => handleHttpChange("url", e.target.value)}
              disabled={loading}>
              <select
                value={formData.httpConfig.method}
                onChange={(e) => handleHttpChange("method", e.target.value)}
                className="bg-transparent text-lightFg-primary dark:text-darkFg-primary p-2 font-mono text-sm"
                disabled={loading}>
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Input>
          </div>
          <TextArea
            label="Parameters Schema (Esquema de Parâmetros)"
            placeholder={`{ "type": "object", "properties": {} }`}
            value={formData.parameters}
            onChange={(e) => handleChange("parameters", e.target.value)}
            disabled={loading}
            showCounter={false}
            rows={4}
          />
          <TextArea
            label="Query Params (Parâmetros de Query)"
            placeholder={`{ "chave": "valor", "dinamico": "{{variavel}}" }`}
            value={formData.queryParams}
            onChange={(e) => handleChange("queryParams", e.target.value)}
            disabled={loading}
            showCounter={false}
            rows={4}
          />
          <TextArea
            label="Headers (Cabeçalhos)"
            placeholder={`{ "Content-Type": "application/json" }`}
            value={formData.headers}
            onChange={(e) => handleChange("headers", e.target.value)}
            disabled={loading}
            showCounter={false}
            rows={4}
          />
          <TextArea
            label="Body (Corpo da Requisição)"
            placeholder={`{ "chave": "valor" }`}
            value={formData.body}
            onChange={(e) => handleChange("body", e.target.value)}
            disabled={loading}
            showCounter={false}
            rows={4}
          />
          <div className="flex items-center gap-2 my-2">
            <Button type="button" variant="outline" $rounded onClick={handleTestRequest} loading={isTesting} disabled={loading || isTesting}>
              {!isTesting && <Play size={16} className="mr-2" />} Testar
            </Button>
          </div>
          {testResult && (
            <>
              <TextArea
                label="Response Mapping (Mapeamento da Resposta)"
                placeholder="Ex: data.results[0].joke"
                value={formData.responseMapping}
                onChange={(e) => handleChange("responseMapping", e.target.value)}
                disabled={loading}
                showCounter={false}
                rows={1}
              />
              <label className="text-xs font-bold text-lightFg-secondary dark:text-darkFg-secondary">Raw Result (Resultado Cru)</label>
              <pre className="text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md max-h-40 overflow-auto">
                <code>{JSON.stringify(testResult, null, 2)}</code>
              </pre>
              <label className="text-xs font-bold text-lightFg-secondary dark:text-darkFg-secondary">Mapping Preview (Preview do Mapeamento)</label>
              <pre className="text-xs bg-lightBg-tertiary dark:bg-darkBg-tertiary p-2 rounded-md max-h-40 overflow-auto">
                <code>
                  {mappingPreview !== undefined
                    ? JSON.stringify(mappingPreview, null, 2)
                    : "Erro: Caminho de mapeamento inválido ou não encontrado na resposta."}
                </code>
              </pre>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 mt-2 border-t border-bLight dark:border-bDark flex-shrink-0">
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
        <Button type="submit" variant="primary" $rounded loading={loading} disabled={loading || !formData.name || !formData.httpConfig.url}>
          {!loading && <Save size={16} className="mr-2" />} Salvar
        </Button>
      </div>
    </form>
  )
})

export default ToolForm
