import React, { useState } from "react"
// Para uma melhor legibilidade e gerenciamento de classes condicionais,
// uma biblioteca como `clsx` ou `tailwind-merge` seria recomendada em um projeto real.
// Para este exemplo, usaremos template literals.

// --- Dados de Mockup (Inalterado) ---
const galleryData = [
  {
    title: "Dia Asoleado",
    url: "https://images.unsplash.com/photo-1590182431693-551b54a7d023?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    gradient: "linear-gradient(to top, #fddb92 0%, #d1fdff 100%)"
  },
  {
    title: "Nieve",
    url: "https://images.unsplash.com/photo-1418985991508-e47386d96a71?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gradient: "linear-gradient(to top, #a1c4fd 0%, #c2e9fb 100%)"
  },
  {
    title: "Bosque",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    gradient: "linear-gradient(to top, #4d6a45 0%, #96c48a 100%)"
  },
  {
    title: "Lluvia",
    url: "https://images.unsplash.com/photo-1515694346937-94d85e41e622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2146&q=80",
    gradient: "linear-gradient(to top, #6b778d 0%, #b8c6db 100%)"
  },
  {
    title: "Viento",
    url: "https://images.unsplash.com/photo-1505672538424-93121a124458?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    gradient: "linear-gradient(to top, #a3bded 0%, #6991c7 100%)"
  }
]

// --- Componente Principal ---

const Gallery = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePanelClick = (index) => {
    setActiveIndex(index)
  }

  return (
    <div className="flex w-[90vw] min-w-[600px] max-w-[900px] h-[400px] gap-[10px] rounded-[20px] overflow-hidden">
      {galleryData.map((item, index) => {
        const isActive = index === activeIndex
        return (
          <div
            key={item.title}
            className={`
              relative bg-cover bg-center cursor-pointer overflow-hidden
              transition-[flex] duration-600 ease-[cubic-bezier(0.61,-0.19,0.7,-0.11)]
              ${isActive ? "flex-[5]" : "flex-[0.5] hover:flex-[0.75]"}
            `}
            style={{ backgroundImage: `url(${item.url})` }}
            onClick={() => handlePanelClick(index)}>
            {/* Overlay de Gradiente: Substitui o pseudo-elemento ::after */}
            <div
              className={`absolute inset-0 w-full h-full transition-opacity duration-400 ease-in-out ${
                isActive ? "opacity-0" : "opacity-100"
              }`}
              style={{ background: item.gradient }}
            />

            {/* Conteúdo do Painel */}
            <div
              className={`
                absolute bottom-5 left-5 z-10 flex items-center gap-3 text-white
                transition-all ease-out duration-400 delay-400
                ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
              `}>
              {/* Ícone '+' desenhado com Tailwind */}
              <div
                className="
                  relative flex items-center justify-center
                  w-8 h-8 min-w-[32px]
                  bg-black/20 rounded-full border-[1.5px] border-white
                  before:content-[''] before:absolute before:w-[2px] before:h-[14px] before:bg-white
                  after:content-[''] after:absolute after:w-[14px] after:h-[2px] after:bg-white
                "
              />
              <h3 className="font-sans whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{item.title}</h3>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Gallery
