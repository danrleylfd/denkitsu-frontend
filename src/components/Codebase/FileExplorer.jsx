const FileExplorer = ({ allFiles, selectedFiles, setSelectedFiles, onGenerate }) => {
  const toggleFile = (file) => {
    if (selectedFiles.includes(file)) {
      setSelectedFiles(selectedFiles.filter((f) => f !== file))
    } else {
      setSelectedFiles([...selectedFiles, file])
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-white">Explorador de Arquivos</h2>

      <div className="flex-1 max-h-64 overflow-y-auto rounded-lg bg-gray-900 p-2">
        {allFiles.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum arquivo carregado</p>
        ) : (
          allFiles.map((file, idx) => (
            <div
              key={idx}
              className={`p-2 rounded cursor-pointer ${
                selectedFiles.includes(file) ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"
              }`}
              onClick={() => toggleFile(file)}
            >
              {file}
            </div>
          ))
        )}
      </div>

      <button
        className="mt-2 w-full p-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-500"
        onClick={onGenerate}
      >
        🚀 Gerar Codebase
      </button>
    </div>
  )
}

export default FileExplorer
