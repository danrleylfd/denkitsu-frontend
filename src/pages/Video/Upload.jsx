import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ImagePlus, UploadIcon, Sparkle, Brain, Waypoints, } from "lucide-react"

import { useAI } from "../../contexts/AIContext"
import { useNotification } from "../../contexts/NotificationContext"

import { sendMessage } from "../../services/aiChat"
import { createVideo } from "../../services/video"

import { resizeImage } from "../../utils/image"

import SideMenu from "../../components/SideMenu"
import Form from "../../components/Form"
import Input from "../../components/Input"
import Button from "../../components/Button"

const ContentView = ({ children }) => (
  <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full h-dvh">
    {children}
  </main>
)

const Upload = () => {
  const { aiKey, model, aiProvider, aiProviderToggle, freeModels, payModels, groqModels } = useAI()
  const { notifyWarning, notifyError, notifyInfo } = useNotification()
  const [content, setContent] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const thumbnailRef = useRef(null)
  const navigate = useNavigate()

  const handleGenerateContent = async () => {
    setLoading(true)
    try {
      const userPrompt = { role: "user", content: `Tema: ${content}` }
      const { data } = await sendMessage(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], [userPrompt], "Blogueiro")
      const message = data?.choices?.[0]?.message
      if (!message) throw new Error("Serviço temporariamente indisponível.")
      setContent(message.content)
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha ao gerar conteúdo com a IA.")
    } finally {
      setLoading(false)
    }
  }

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    try {
      const resizedBase64 = await resizeImage(file)
      setThumbnail(resizedBase64)
    } catch (err) {
      notifyError(err.message)
      setThumbnail("")
    } finally {
      setLoading(false)
      e.target.value = null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content || !thumbnail || !fileUrl) return notifyWarning("Por favor, preencha todos os campos.")
    setLoading(true)
    try {
      await createVideo({ content, thumbnail, fileUrl })
      notifyInfo("Vídeo enviado com sucesso!")
      navigate("/my-videos")
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Falha ao fazer upload do vídeo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-brand-purple">
      <Form title="Upload" onSubmit={handleSubmit}>
        <Input
          name="content"
          type="text"
          placeholder="Digite o conteúdo da publicação"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            $rounded
            title="Reescrever"
            onClick={handleGenerateContent}
            loading={loading}
            disabled={!content}>
            {!loading && <Sparkle size={16} />}
          </Button>
          <Button
            variant={aiProvider === "groq" ? "warning" : "info"}
            size="icon"
            $rounded
            onClick={aiProviderToggle}
            title={aiProvider === "groq" ? "Provedor: Groq" : "Provedor: OpenRouter"}
          >
            <Waypoints size={16} />
          </Button>
        </Input>
        <div className="flex gap-2">
          <Input
            name="thumbnail"
            type="text"
            placeholder="Cole a url ou escolha uma imagem"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            disabled={loading}>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              $rounded
              title="Escolher arquivo de imagem"
              onClick={() => thumbnailRef.current?.click()}
              loading={loading}>
              {!loading && <ImagePlus size={16} />}
            </Button>
          </Input>
          <Input ref={thumbnailRef} type="file" accept="image/*" onChange={handleThumbnailChange} disabled={loading} containerClassName="hidden" />
        </div>
        <Input
          name="fileUrl"
          type="text"
          placeholder="Cole a url do vídeo"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" $rounded title="Publicar" loading={loading} disabled={!content || !thumbnail || !fileUrl}>
          {!loading && <UploadIcon size={16} />}
          {!loading && "Publicar"}
        </Button>
      </Form>
    </SideMenu>
  )
}

export default Upload
