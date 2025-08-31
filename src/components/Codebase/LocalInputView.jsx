const LocalInputView = ({ setStep, setIsProcessing }) => {
  return (
    <button
      className="w-full p-4 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-500"
      onClick={() => {
        setIsProcessing(true)
        setStep("explorer")
      }}
    >
      📂 Selecionar pasta local
    </button>
  )
}

export default LocalInputView
