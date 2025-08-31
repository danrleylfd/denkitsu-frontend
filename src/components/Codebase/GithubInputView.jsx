const GithubInputView = ({ setStep, setIsProcessing }) => {
  return (
    <button
      className="w-full p-4 bg-gray-800 text-white rounded-xl shadow hover:bg-gray-700"
      onClick={() => {
        setIsProcessing(true)
        setStep("explorer")
      }}
    >
      🐙 Importar de repositório GitHub
    </button>
  )
}

export default GithubInputView
