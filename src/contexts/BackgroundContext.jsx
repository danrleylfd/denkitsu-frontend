import { createContext, useContext, useState, useEffect, useCallback } from "react"

const BackgroundContext = createContext(null)

const unsplashApiUrl = "https://api.unsplash.com/photos/random"
const unsplashAccessKey = "G0_VOjkauHvBWnVTKcMVKGlpumo7trpktjRD-y7YHMQ"

export const BackgroundProvider = ({ children }) => {
  const [background, setBackground] = useState(null)

  const fetchNewBackground = useCallback(async () => {
    if (!unsplashAccessKey) {
      console.error("Chave da API do Unsplash não configurada. Verifique o arquivo .env")
      return
    }
    try {
      const response = await fetch(`${unsplashApiUrl}?query=dark-abstract-wallpaper&orientation=landscape&client_id=G0_VOjkauHvBWnVTKcMVKGlpumo7trpktjRD-y7YHMQ`)
      if (!response.ok) {
        throw new Error(`Erro na API do Unsplash: ${response.statusText}`)
      }
      const data = await response.json()
      setBackground({
        url: data.urls.full,
        authorName: data.user.name,
        authorLink: data.user.links.html,
      })
    } catch (err) {
      setBackground({ url: "/background.jpg" })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNewBackground()
  }, [])

  const value = {
    background,
    bgUrl: background?.url,
  }

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  )
}

export const useBackground = () => {
  const context = useContext(BackgroundContext)
  if (!context) {
    throw new Error("useBackground deve ser usado dentro de um BackgroundProvider")
  }
  return context
}
