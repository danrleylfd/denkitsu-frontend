const PromptInput = ({ textareaRef, inputText, setInputText, handleKeyDown, loading }) => (
  <textarea
    id="prompt-input"
    ref={textareaRef}
    value={inputText}
    onChange={(e) => setInputText(e.target.value)}
    onKeyDown={handleKeyDown}
    placeholder={!loading ? "Escreva seu prompt" : "Pensando..."}
    disabled={loading}
    rows={1}
    className="flex-1 resize-y min-h-[44px] max-h-[120px] max-w-full overflow-y-hidden px-2 py-4 rounded-md font-mono text-sm bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary"
    data-oid="82phzz7"
  />
)

export default PromptInput
