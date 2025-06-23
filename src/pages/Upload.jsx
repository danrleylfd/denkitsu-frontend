import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { MdImage, MdUpload } from "react-icons/md"
import { LuSparkles } from "react-icons/lu"

import { useAI } from "../contexts/AIContext"

import { sendMessage } from "../services/aiChat"
import { createVideo } from "../services/video"
import { resizeImage } from "../utils/image"

import SideMenu from "../components/SideMenu"
import Form from "../components/Form"
import Input from "../components/Input"
import Button from "../components/Button"
import { MessageError } from "../components/Notifications"

const ContentView = ({ children }) => <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full h-screen">{children}</main>

const Upload = () => {
  const { aiKey, model } = useAI()
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
      const data = await sendMessage(aiKey, model, [prompt])
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
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple">
      <Form title="Upload" onSubmit={handleSubmit}>
        <Input
          name="content"
          type="text"
          placeholder="Digite o conteúdo da publicação"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}>
          <Button type="button" variant="outline" size="icon" $rounded title="Reescrever" onClick={handleGenerateContent} loading={loading} disabled={!content}>
            {!loading && <LuSparkles size={16} />}
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
            <Button variant="secondary" size="icon" $rounded title="Escolher arquivo de imagem" onClick={() => thumbnailRef.current?.click()} loading={loading}>
              {!loading && <MdImage size={16} />}
            </Button>
          </Input>
          <Input
            ref={thumbnailRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            disabled={loading}
            containerClassName="hidden"
          />
        </div>

        <Input name="fileUrl" type="text" placeholder="Cole a url do vídeo" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} disabled={loading} />

        <Button type="submit" $rounded title="Publicar" loading={loading} disabled={!content || !thumbnail || !fileUrl}>
          {!loading && <MdUpload />}
          {!loading && "Publicar"}
        </Button>

        {error && <MessageError>{error}</MessageError>}
      </Form>
    </SideMenu>
  )
}

export default Upload
