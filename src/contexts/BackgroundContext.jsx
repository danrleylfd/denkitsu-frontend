import { createContext, useContext, useState, useEffect, useCallback } from "react"

const BackgroundContext = createContext(null)

const unsplashApiUrl = "https://api.unsplash.com/photos/random"
const unsplashAccessKey = "G0_VOjkauHvBWnVTKcMVKGlpumo7trpktjRD-y7YHMQ"

const BackgroundProvider = ({ children }) => {
  const [background, setBackground] = useState("/background.jpg")

  const fetchNewBackground = useCallback(async () => {
    if (!unsplashAccessKey) {
      console.error("Chave da API do Unsplash não configurada.")
      return
    }
    try {
      const response = await fetch(`${unsplashApiUrl}?query=wallpaper&orientation=landscape&client_id=${unsplashAccessKey}`)
      if (!response.ok) throw new Error(`Erro na API do Unsplash: ${response.statusText}`)
      const data = await response.json()
      const regularUrl = data.urls.regular
      const fullUrl = data.urls.full
      console.log(fullUrl)
      setBackground(regularUrl)
      const highResImage = new Image()
      highResImage.src = fullUrl
      highResImage.onload = () => {
        setBackground(fullUrl)
        console.log("Plano de fundo trocado para alta resolução.")
      }
      highResImage.onerror = () => {
        console.error("Falha ao carregar a imagem em alta resolução. Mantendo a versão regular.")
      }
    } catch (err) {
      console.error("Falha ao buscar novo plano de fundo:", err)
      setBackground("/background.jpg")
    }
  }, [])

  useEffect(() => {
    fetchNewBackground()
  }, [fetchNewBackground])

  return (
    <BackgroundContext.Provider value={{ background }}>
      {children}
    </BackgroundContext.Provider>
  )
}

const useBackground = () => {
  const context = useContext(BackgroundContext)
  if (!context) {
    throw new Error("useBackground deve ser usado dentro de um BackgroundProvider")
  }
  return context
}

export { useBackground }
export default BackgroundProvider
