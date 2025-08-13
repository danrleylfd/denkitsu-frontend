import { useState, useRef, useEffect } from "react"

const AIInput = ({
  node,
  className,
  disabled,
  rows = 1,
  maxLength = 2048,
  suggestions = ["/site ","/duckduckgo ","/http ","/cripto ","/nasa ","/notícias ","/clima ","wikipedia ","/cinema ","/jogos ","/albion ","/genshin ","/pokédex "],
  value: externalValue,
  onChange: externalOnChange,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  const value = externalValue !== undefined ? externalValue : internalValue;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const inputValue = e.target.value;

    if (externalOnChange) externalOnChange(e);
    else setInternalValue(inputValue);

    if (inputValue.trim().length > 0) {
      const filteredSuggestions = suggestions.filter((item) =>
        item.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFiltered(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (suggestion) => {
    if (externalOnChange) {
      externalOnChange({ target: { value: suggestion } });
    } else {
      setInternalValue(suggestion);
    }
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {showSuggestions && (
        <ul className="absolute bottom-full left-0 w-full mb-4 bg-lightBg-primary dark:bg-darkBg-primary border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-40 overflow-auto">
          {filtered.map((item, index) => (
            <li
              key={index}
              className="p-2 cursor-pointer hover:bg-lightBg-secondary dark:hover:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary"
              onClick={() => handleSelect(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
      <textarea
        className={"flex-1 resize-none min-h-[1.25rem] max-h-[19rem] w-full overflow-y-auto p-2 rounded-md font-mono text-sm bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary " + className}
        rows={rows}
        maxLength={maxLength}
        placeholder={!disabled ? "Escreva seu prompt" : "Pensando..."}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />
    </div>
  )
}

export default AIInput
