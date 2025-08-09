import { useAI } from "../../contexts/AIContext"

const AIModelSelect = ({ loading }) => {
  const { setAIProvider, freeModels, payModels, groqModels, model, setModel } = useAI()
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
      className="bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary text-sm py-2 w-full rounded-full">
      <option className="text-lightFg-primary dark:text-darkFg-primary" disabled value="">
        Selecionar Modelo
      </option>
      <option className="text-lightFg-primary dark:text-darkFg-primary" disabled value="">
        OpenRouter Gratuito
      </option>
      {freeModels.map((model) => (
        <option key={model.id} value={model.id} className="text-lightFg-secondary dark:text-darkFg-secondary">
          {model.id}
          {model.supports_tools && " 🛠️"}
          {model.supports_images && " 🖼️"}
          {model.supports_files && " 📄"}
        </option>
      ))}
      <option className="text-lightFg-primary dark:text-darkFg-primary" disabled value="">
        OpenRouter Premium
      </option>
      {payModels.map((model) => (
        <option key={model.id} value={model.id} className="text-lightFg-secondary dark:text-darkFg-secondary">
          {model.id}
          {model.supports_tools && " 🛠️"}
          {model.supports_images && " 🖼️"}
          {model.supports_files && " 📄"}
        </option>
      ))}
      <option className="text-lightFg-primary dark:text-darkFg-primary" disabled value="">
        Groq Gratuito
      </option>
      {groqModels.map((model) => (
        <option key={model.id} value={model.id} className="text-lightFg-secondary dark:text-darkFg-secondary">
          {model.id}
          {model.supports_tools && " 🛠️"}
          {model.supports_images && " 🖼️"}
          {model.supports_files && " 📄"}
        </option>
      ))}
    </select>
  )
}

export default AIModelSelect
