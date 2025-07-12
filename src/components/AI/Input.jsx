const AIInput = ({ node, className, disabled, rows = 1, maxLength = 2048, ...props }) => (
  <textarea
    className={"flex-1 resize-none min-h-[1.25rem] max-h-[11rem] max-w-full overflow-y-auto p-2 rounded-md font-mono text-sm bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary " + className}
    rows={rows}
    maxLength={maxLength}
    placeholder={!disabled ? "Escreva seu prompt" : "Pensando..."}
    {...props}
  />
)

export default AIInput
