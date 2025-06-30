const ModelSelect = ({ aiProvider, setAIProvider, model, setModel, loading, freeModels, payModels, groqModels }) => {
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
      className="bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary text-sm py-2 max-w-[20rem] rounded-md">
      <option className="text-primary-base" disabled value="0">
        Selecionar Modelo
      </option>
      {aiProvider === "openrouter" && (
        <option className="text-primary-base" disabled>
          OpenRouter Gratuito
        </option>
      )}
      {aiProvider === "openrouter" && freeModels.map((model) => (
        <option key={model.id} value={model.id}>
          {model.id}
        </option>
      ))}
      {aiProvider === "openrouter" && (
        <option className="text-primary-base" disabled>
          OpenRouter Premium
        </option>
      )}
      {aiProvider === "openrouter" && payModels.map((model) => (
        <option key={model.id} value={model.id}>
          {model.id}
        </option>
      ))}
      {aiProvider === "groq" && (
        <option className="text-primary-base" disabled>
          Groq Gratuito
        </option>
      )}
      {aiProvider === "groq" && groqModels.map((model) => (
        <option key={model.id} value={model.id}>
          {model.id}
        </option>
      ))}
    </select>
  )
}

export default ModelSelect
