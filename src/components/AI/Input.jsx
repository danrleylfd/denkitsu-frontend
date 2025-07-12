const AIInput = ({ node, loading, rows = 1, maxLength = 2048, ...props }) => (
  <textarea
    placeholder={!loading ? "Escreva seu prompt" : "Pensando..."}
    disabled={loading}
    rows={rows}
    maxLength={maxLength}
    className="flex-1 resize-y min-h-[1.25rem] max-h-[7.5rem] max-w-full overflow-y-auto p-2 rounded-md font-mono text-sm bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary "
    {...props}
  />
)

export default AIInput
