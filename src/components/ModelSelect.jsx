const ModelSelect = ({ model, setModel, loading, freeModels, payModels, groqModels }) => (
  <select
    id="model-select"
    value={model}
    onChange={(e) => setModel(e.target.value)}
    disabled={loading}
    className="bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary text-sm min-h-[48px] max-w-[6.5rem] rounded-md">
    <option disabled value="">Selecionar Modelo</option>
    <option disabled>Gratuito</option>
    {freeModels.map((model) => (
      <option key={model.id} value={model.id}>
        {model.id}
      </option>
    ))}
    <option disabled>Premium</option>
    {payModels.map((model) => (
      <option key={model.id} value={model.id}>
        {model.id}
      </option>
    ))}
    <option disabled>Groq</option>
    {groqModels.map((model) => (
      <option key={model.id} value={model.id}>
        {model.id}
      </option>
    ))}
  </select>
)

export default ModelSelect
