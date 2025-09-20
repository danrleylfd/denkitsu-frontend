export const extractVideoThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const url = URL.createObjectURL(file)
    video.muted = true
    video.playsInline = true
    video.crossOrigin = "anonymous"
    video.preload = "metadata"
    video.src = url

    const cleanup = () => {
      URL.revokeObjectURL(url)
      video.remove()
    }

    video.onloadeddata = () => {
      video.currentTime = 1 // Pula para o 1º segundo para capturar um frame
    }

    video.onseeked = () => {
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8) // Qualidade 80%
      cleanup()
      resolve(thumbnailUrl)
    }

    video.onerror = (err) => {
      console.error("Erro no elemento de vídeo:", err)
      cleanup()
      reject(new Error("Não foi possível carregar o arquivo de vídeo para gerar a thumbnail."))
    }
  })
}
