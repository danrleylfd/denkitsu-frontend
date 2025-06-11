import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { MdImage, MdUpload } from "react-icons/md"
import { VscLightbulbSparkle } from "react-icons/vsc"

import { sendMessage } from "../../../services/aiChat"
import { createVideo } from "../../../services/video"

import SideMenu from "../../../components/SideMenu"
import Form from "../../../components/Form"
import Input from "../../../components/Input"
import Button from "../../../components/Button"
import { MessageError } from "../../../components/Notifications"

import { SideContentContainer } from "./styles"

const Upload = () => {
  const [content, setContent] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const thumbnailRef = useRef(null)
  const navigate = useNavigate()
  const handleGenerateContent = async () => {
    setLoading(true)
    try {
      const prompt = { role: "user", content: `Ativar Modo Influencer para uma única mensagem. Assunto: ${content}` }
      const data = await sendMessage(null, [prompt])
      if (data.error) return setError(data.error.message)
      const message = data?.choices?.[0]?.message
      if (!message) return setError("Serviço temporariamente indisponível.")
      setContent(message.content)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!content || !thumbnail || !fileUrl) {
      setError("Por favor, preencha todos os campos.")
      return
    }
    setLoading(true)
    try {
      await createVideo({ content, thumbnail, fileUrl })
      navigate("/my-videos")
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (!file) {
      setError("Por favor, selecione uma imagem.")
      setThumbnail("")
      setLoading(false)
      return
    }
    setLoading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      const originalBase64 = reader.result
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 600
        let { width, height } = img
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          setError("Não foi possível processar a imagem. Tente novamente.")
          setThumbnail(originalBase64)
          setLoading(false)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        let newBase64
        if (file.type === "image/png") {
          newBase64 = canvas.toDataURL("image/png")
        } else {
          newBase64 = canvas.toDataURL("image/jpeg", 1)
        }
        setThumbnail(newBase64)
        setLoading(false)
      }
      img.onerror = () => {
        setError("Erro ao carregar a imagem para processamento. Verifique o formato ou se está corrompida.")
        setThumbnail(originalBase64)
        setLoading(false)
      }
      img.src = originalBase64
    }
    reader.onerror = () => {
      setError("Falha ao ler o arquivo da imagem. Tente novamente.")
      setThumbnail("")
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <SideMenu ContentView={SideContentContainer}>
      <Form title="Upload">
          <Input
            name="content"
            type="text"
            placeholder="Digite o conteúdo da publicação"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          >
            <Button type="button" variant="warning" size="icon" $rounded title="Reescrever" onClick={handleGenerateContent} loading={loading} disabled={!content}>
              {!loading && <VscLightbulbSparkle size={16}/>}
            </Button>

          </Input>
        <div style={{ display: "flex", gap: 8 }}>
          <Input
            name="thumbnail"
            type="text"
            placeholder="Cole a url ou escolha uma imagem"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            disabled={loading}
          >
            <Button variant="secondary" size="icon" $rounded title="Escolher arquivo de imagem" onClick={() => thumbnailRef.current?.click()} loading={loading} disabled={loading}>
              {!loading && <MdImage size={16} />}
            </Button>
          </Input>
          <Input
            containerStyle={{ display: "none" }}
            style={{ display: "none" }}
            ref={thumbnailRef}
            name="thumbnail"
            type="file"
            accept="image/*"
            placeholder="Selecione uma imagem"
            onChange={handleThumbnailChange}
            disabled={loading}
          />
        </div>
        <Input name="fileUrl" type="text" placeholder="Cole a url do vídeo" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} disabled={loading} />
        <Button type="submit" $rounded title="Publicar" onClick={handleSubmit} loading={loading} disabled={!content || !thumbnail || !fileUrl}>
          {!loading && <MdUpload />}
          {!loading && "Publicar"}
        </Button>
        {error && <MessageError>{error}</MessageError>}
      </Form>
    </SideMenu>
  )
}

export default Upload
