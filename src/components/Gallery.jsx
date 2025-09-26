import React, { useState } from "react"
// Para uma melhor legibilidade e gerenciamento de classes condicionais,
// uma biblioteca como `clsx` ou `tailwind-merge` seria recomendada em um projeto real.
// Para este exemplo, usaremos template literals.

// --- Dados de Mockup (Inalterado) ---
const galleryData = [
  {
    title: "Dia Asoleado",
    url: "https://images.unsplash.com/photo-1693298484405-d2603ec2abe3?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
    url: "https://images.unsplash.com/uploads/14116603688211a68546c/30f8f30b?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    gradient: "linear-gradient(to top, #6b778d 0%, #b8c6db 100%)"
  },
  {
    title: "Viento",
    url: "https://images.unsplash.com/photo-1671095368506-6ea49f300daa?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
    <div className="flex w-[90vw] min-w-[600px] max-w-full h-[300px] gap-[10px]">
      {galleryData.map((item, index) => {
        const isActive = index === activeIndex
        return (
          <div
            key={item.title}
            className={`
              relative bg-cover bg-center cursor-pointer overflow-hidden
              transition-[flex,border-radius] duration-700 ease-out

              /* EFEITO HOVER RESTAURADO:
                 A classe 'hover:flex-[0.75]' foi adicionada de volta ao estado inativo.
              */
              ${isActive ? "flex-[5] rounded-[20px]" : "flex-[0.5] hover:flex-[0.75] rounded-full"}
            `}
            style={{ backgroundImage: `url(${item.url})` }}
            onClick={() => handlePanelClick(index)}>
            <div
              className={`absolute inset-0 w-full h-full transition-opacity duration-400 ease-in-out ${
                isActive ? "opacity-0" : "opacity-80"
              }`}
              style={{ background: item.gradient }}
            />

            <div
              className={`
                absolute z-10 flex items-center text-white
                transition-all duration-500 ease-out
                ${isActive ? "bottom-5 left-5 gap-3" : "bottom-3 inset-x-0 justify-center"}
              `}>
              <div
                className="
                  relative flex items-center justify-center
                  w-8 h-8 min-w-[32px]
                  bg-black/20 rounded-full border-[1.5px] border-white
                  before:content-[''] before:absolute before:w-[2px] before:h-[14px] before:bg-white
                  after:content-[''] after:absolute after:w-[14px] after:h-[2px] after:bg-white
                "
              />
              <h3
                className={`
                  font-sans whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]
                  overflow-hidden transition-all duration-500 ease-out
                  ${isActive ? "max-w-xs opacity-100 ml-0" : "max-w-0 opacity-0"}
                `}>
                {item.title}
              </h3>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Gallery
