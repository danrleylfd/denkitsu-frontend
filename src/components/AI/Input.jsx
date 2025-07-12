const AIInput = ({ textareaRef, userPrompt, setUserPrompt, handleKeyDown, loading }) => (
  <textarea
    id="prompt-input"
    ref={textareaRef}
    value={userPrompt}
    onChange={(e) => setUserPrompt(e.target.value)}
    onKeyDown={handleKeyDown}
    placeholder={!loading ? "Escreva seu prompt" : "Pensando..."}
    disabled={loading}
    rows={1}
    className="flex-1 resize-y min-h-[1.25rem] max-h-[7.5rem] max-w-full overflow-y-auto p-2 rounded-md font-mono text-sm bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary "
  />
)

export default AIInput
