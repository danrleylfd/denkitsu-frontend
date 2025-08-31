const RecentItemsList = ({ items, setStep, setIsProcessing }) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-gray-400 text-sm font-semibold">Recentes</h3>
      {items.length === 0 ? (
        <p className="text-xs text-gray-500">Nenhum item recente</p>
      ) : (
        items.map((item, idx) => (
          <button
            key={idx}
            className="p-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            onClick={() => {
              setIsProcessing(true)
              setStep("explorer")
            }}
          >
            {item}
          </button>
        ))
      )}
    </div>
  )
}

export default RecentItemsList
