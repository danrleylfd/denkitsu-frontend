const resizeImage = (file, maxWidth = 800, maxHeight = 600) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let { width, height } = img

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (!ctx) return reject(new Error("Não foi possível processar a imagem."))

        ctx.drawImage(img, 0, 0, width, height)
        const resizedBase64 = canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 1)
        resolve(resizedBase64)
      }

      img.onerror = () => reject(new Error("Erro ao carregar a imagem para processamento."))
      img.src = e.target.result
    }

    reader.onerror = () => reject(new Error("Falha ao ler o arquivo da imagem."))
    reader.readAsDataURL(file)
  })
}

export { resizeImage }
