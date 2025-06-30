import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { MdImage, MdUpload } from "react-icons/md"
import { LuSparkles, LuBrain } from "react-icons/lu"

import { useAI } from "../contexts/AIContext"

import { sendMessage } from "../services/aiChat"
import { createVideo } from "../services/video"
import { resizeImage } from "../utils/image"

import SideMenu from "../components/SideMenu"
import Form from "../components/Form"
import Input from "../components/Input"
import Button from "../components/Button"
import { MessageError } from "../components/Notifications"

const ContentView = ({ children }) => (
  <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full h-screen" data-oid="2ypispj">
    {children}
  </main>
)

const Upload = () => {
  const { aiKey, model, aiProvider, aiProviderToggle } = useAI()
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
      const prompt = { role: "user", content: `Modo Blogueiro, Tema: ${content}` }
      const data = await sendMessage(aiKey, aiProvider, model, [prompt])
      if (data.error) return setError(data.error.message)
      const message = data?.choices?.[0]?.message
      if (!message) return setError("Serviço temporariamente indisponível.")
      setContent(message.content)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setError(null)
    try {
      const resizedBase64 = await resizeImage(file)
      setThumbnail(resizedBase64)
    } catch (err) {
      setError(err.message)
      setThumbnail("")
    } finally {
      setLoading(false)
      e.target.value = null
    }
  }

  const handleSubmit = async () => {
    setError(null)
    if (!content || !thumbnail || !fileUrl) return setError("Por favor, preencha todos os campos.")

    setLoading(true)
    try {
      await createVideo({ content, thumbnail, fileUrl })
      navigate("/my-videos")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple" data-oid="znz43ct">
      <Form title="Upload" onSubmit={handleSubmit} data-oid="cvk1zmj">
        <Input
          name="content"
          type="text"
          placeholder="Digite o conteúdo da publicação"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          data-oid="-w2h2rs">
          <Button
            type="button"
            variant="outline"
            size="icon"
            $rounded
            title="Reescrever"
            onClick={handleGenerateContent}
            loading={loading}
            disabled={!content}
            data-oid="._pan7u">
            {!loading && <LuSparkles size={16} data-oid="s-5p59b" />}
          </Button>
          <Button
            variant={aiProvider === "groq" ? "gradient-orange" : "gradient-blue"}
            size="icon"
            $rounded
            onClick={aiProviderToggle}
            title={aiProvider === "groq" ? "Groq" : "OpenRouter"}
            data-oid="q0.dy03">
            <LuBrain size={16} data-oid="8ofmzwt" />
          </Button>
        </Input>

        <div className="flex gap-2" data-oid="1vj7r8_">
          <Input
            name="thumbnail"
            type="text"
            placeholder="Cole a url ou escolha uma imagem"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            disabled={loading}
            data-oid="km1g53o">
            <Button
              variant="secondary"
              size="icon"
              $rounded
              title="Escolher arquivo de imagem"
              onClick={() => thumbnailRef.current?.click()}
              loading={loading}
              data-oid="3csts4i">
              {!loading && <MdImage size={16} data-oid="aa:7ia:" />}
            </Button>
          </Input>
          <Input ref={thumbnailRef} type="file" accept="image/*" onChange={handleThumbnailChange} disabled={loading} containerClassName="hidden" data-oid="l3r8r6t" />
        </div>

        <Input
          name="fileUrl"
          type="text"
          placeholder="Cole a url do vídeo"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          disabled={loading}
          data-oid="fm8ew_n"
        />

        <Button type="submit" $rounded title="Publicar" loading={loading} disabled={!content || !thumbnail || !fileUrl} data-oid="irpy084">
          {!loading && <MdUpload data-oid="wq63wzz" />}
          {!loading && "Publicar"}
        </Button>

        {error && <MessageError data-oid="_a-8n20">{error}</MessageError>}
      </Form>
    </SideMenu>
  )
}

export default Upload
