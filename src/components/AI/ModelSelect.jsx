import { useModels } from "../../contexts/ModelContext"

const AIModelSelect = ({ loading }) => {
  const { aiProvider, model, freeModels, payModels, groqModels, setModel } = useModels()
  return (
    <select
      id="model-select"
      value={model}
      onChange={(e) => setModel(e.target.value)}
      disabled={loading}
      className="bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary text-sm py-2 w-full rounded-full">
      <option className="text-lightFg-primary dark:text-darkFg-primary" disabled value="">
        Selecionar Modelo
      </option>
      {aiProvider === "openrouter" && <option className="text-lightFg-primary dark:text-darkFg-primary" disabled value="">
        OpenRouter Gratuito:
      </option>}
      {aiProvider === "openrouter" && freeModels.map((model) => (
        <option key={model.id} value={model.id} className="text-lightFg-secondary dark:text-darkFg-secondary">
          {model.id}
          {model.supports_tools && " 🛠️"}
          {model.supports_images && " 🖼️"}
          {model.supports_files && " 📄"}
        </option>
      ))}
      {aiProvider === "openrouter" && <option className="text-lightFg-primary dark:text-darkFg-primary" disabled value="">
        OpenRouter Premium:
      </option>}
      {aiProvider === "openrouter" && payModels.map((model) => (
        <option key={model.id} value={model.id} className="text-lightFg-secondary dark:text-darkFg-secondary">
          {model.id}
          {model.supports_tools && " 🛠️"}
          {model.supports_images && " 🖼️"}
          {model.supports_files && " 📄"}
        </option>
      ))}
      {aiProvider === "groq" && <option className="text-lightFg-primary dark:text-darkFg-primary" disabled value="">
        Groq Gratuito:
      </option>}
      {aiProvider === "groq" && groqModels.map((model) => (
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
