const ModelSelect = ({ setAIProvider, model, setModel, loading, freeModels, payModels, groqModels }) => {
  const findProviderByModel = (model) => {
    if (freeModels.find((m) => m.id === model)) return "openrouter"
    if (payModels.find((m) => m.id === model)) return "openrouter"
    if (groqModels.find((m) => m.id === model)) return "groq"
    return null
  }
  const handleChange = (e) => {
    setModel(e.target.value)
    const provider = findProviderByModel(e.target.value)
    setAIProvider(provider)
  }
  return (
    <select
      id="model-select"
      value={model}
      onChange={handleChange}
      disabled={loading}
      className="bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary text-sm min-h-[48px] max-w-[20rem] rounded-md"
      data-oid=".028eat">
      <option className="text-primary-base" disabled value="" data-oid="wleskuv">
        Selecionar Modelo
      </option>
      <option className="text-primary-base" disabled data-oid="_nw6ry:">
        OpenRouter Gratuito
      </option>
      {freeModels.map((model) => (
        <option key={model.id} value={model.id} data-oid="eoynmvj">
          {model.id}
        </option>
      ))}
      <option className="text-primary-base" disabled data-oid="uqxwl4b">
        OpenRouter Premium
      </option>
      {payModels.map((model) => (
        <option key={model.id} value={model.id} data-oid="35ak3v9">
          {model.id}
        </option>
      ))}
      <option className="text-primary-base" disabled data-oid="pd98rc3">
        Groq Gratuito
      </option>
      {groqModels.map((model) => (
        <option key={model.id} value={model.id} data-oid="1ag69t3">
          {model.id}
        </option>
      ))}
    </select>
  )
}

export default ModelSelect
