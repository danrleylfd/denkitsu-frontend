import { useState, useMemo } from "react"
import { X, Search } from "lucide-react"

import { iconNames } from "../utils/icons"

import DynamicIcon from "./DynamicIcon"
import Input from "./Input"
import Button from "./Button"

const IconPicker = ({ isOpen, onClose, onSelect, currentIcon }) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredIcons = useMemo(() => {
    if (!searchTerm) {
      return iconNames.slice(0, 150)
    }
    return iconNames.filter(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-2xl h-[70vh] rounded-lg bg-lightBg-primary dark:bg-darkBg-primary shadow-2xl p-4 gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-xl text-lightFg-primary dark:text-darkFg-primary">Selecione um Ícone</h3>
          <Button variant="danger" size="icon" $rounded onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <Input
          placeholder="Buscar ícone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftContent={
            <div className="pl-2">
              <Search size={16} className="text-lightFg-secondary dark:text-darkFg-secondary" />
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(3rem,1fr))] gap-2">
            {filteredIcons.map(name => (
              <button
                key={name}
                type="button"
                onClick={() => onSelect(name)}
                title={name}
                className={`flex items-center justify-center aspect-square rounded-md transition-colors ${
                  currentIcon === name
                    ? "bg-primary-base text-white"
                    : "bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-secondary dark:text-darkFg-secondary hover:bg-lightBg-tertiary dark:hover:bg-darkBg-tertiary"
                }`}
              >
                <DynamicIcon name={name} size={24} />
              </button>
            ))}
            {searchTerm && filteredIcons.length === 0 && (
              <p className="col-span-full text-center text-lightFg-secondary dark:text-darkFg-secondary">Nenhum ícone encontrado.</p>
            )}
             {!searchTerm && (
              <p className="col-span-full text-center text-sm text-lightFg-tertiary dark:text-darkFg-tertiary">Mostrando 150 de {iconNames.length}. Use a busca para ver mais.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IconPicker
