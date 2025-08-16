import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
// ADICIONADO: Ícones 'Square' para parar gravação e 'Upload' para o botão de upload.
import { Lock, Brain, Waypoints, Settings, ImagePlus, Wrench, AudioWaveform, Mic, MessageCirclePlus, Send, Bot, Speech, Square, Upload, UserPlus, LogIn } from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useAI } from "../../contexts/AIContext"
import { useNotification } from "../../contexts/NotificationContext"
// ADICIONADO: Importa o novo serviço para se comunicar com o backend.
import { transcribeAudio } from "../../services/audio"

import Paper from "../Paper"
import AIInput from "./Input"
import Button from "../Button"

const AIBar = ({ loading, onAddImage, imageCount, onSendMessage, toggleSettingsDoor, agentsDoor, toggleAgentsDoor, toolsDoor, toggleToolsDoor }) => {
  const { signed } = useAuth()
  const {
    aiProvider, aiProviderToggle, aiKey,
    userPrompt, setUserPrompt,
    clearHistory,
    model, freeModels, payModels, groqModels,
    stream, toggleStream,
    listening, setListening, toggleListening,
  } = useAI()
  // ADICIONADO: Hook de notificação para dar feedback ao usuário.
  const { notifyError, notifyInfo } = useNotification()

  // ADICIONADO: Estado para controlar se a gravação está ativa.
  const [isRecording, setIsRecording] = useState(false)
  // ADICIONADO: Estado de loading específico para o processamento de áudio, para não travar a UI inteira.
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  // ADICIONADO: Referência para a instância do MediaRecorder, que gerencia a gravação.
  const mediaRecorderRef = useRef(null)
  // ADICIONADO: Referência para armazenar os "pedaços" (chunks) de áudio gravados.
  const audioChunksRef = useRef([])
  // ADICIONADO: Referência para o input de arquivo que ficará escondido.
  const fileInputRef = useRef(null)

  const recognitionRef = useRef(null)

  const allModels = [...freeModels, ...payModels, ...groqModels]
  const selectedModel = allModels.find(m => m.id === model)
  const isImageSupported = selectedModel?.supports_images ?? false

  // ADICIONADO: Função central para enviar o áudio (Blob) para o servidor.
  const sendAudioToServer = async (audioBlob) => {
    setIsProcessingAudio(true)
    try {
      // Chama o serviço que faz a requisição para o backend.
      const transcription = await transcribeAudio(audioBlob)
      if (transcription && transcription.trim().length > 0) {
        // Cria o prompt de resumo e o insere na caixa de texto.
        setUserPrompt(`Resuma o seguinte áudio: "${transcription}"`)
        // O setTimeout garante que o estado do React seja atualizado antes de chamar onSendMessage.
        setTimeout(() => onSendMessage(true), 100)
      } else {
        notifyInfo("O áudio parece estar vazio ou sem falas detectáveis.")
      }
    } catch (err) {
      if (err.response && err.response.data.error) {
        notifyError(err.response.data.error.message)
      } else {
        notifyError("Falha ao processar o áudio.")
      }
    } finally {
      setIsProcessingAudio(false)
    }
  }

  // ADICIONADO: Função para iniciar a gravação de áudio.
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      // Quando um pedaço de áudio estiver disponível, armazena no ref.
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      // Quando a gravação para, junta os pedaços e envia ao servidor.
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        sendAudioToServer(audioBlob)
        audioChunksRef.current = []
        // Libera o microfone para o ícone no navegador sumir.
        stream.getTracks().forEach(track => track.stop())
      }
      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      notifyError("Não foi possível acessar o microfone.")
    }
  }

  // ADICIONADO: Função para parar a gravação.
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // ADICIONADO: Função para acionar o clique no input de arquivo escondido.
  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  // ADICIONADO: Função que executa quando um arquivo é selecionado.
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validação de tamanho conforme limite da API da Groq.
      if (file.size > 25 * 1024 * 1024) {
        notifyError("O arquivo de áudio não pode exceder 25 MB.")
        return
      }
      sendAudioToServer(file)
    }
    // Limpa o valor para permitir o upload do mesmo arquivo em sequência.
    event.target.value = ""
  }

  // MODIFICADO: A função de envio agora aceita um parâmetro para "forçar" o envio.
  const handleSendMessage = (force = false) => {
    if (loading || isProcessingAudio) return
    // A verificação agora inclui o "force" para permitir que a transcrição dispare o envio.
    if (!userPrompt.trim() && imageCount === 0 && !force) return
    onSendMessage()
  }

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Reconhecimento de voz não é suportado neste navegador.")
      return
    }
    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "pt-BR"
    recognition.onresult = (event) => {
      let finalTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript
      }
      if (finalTranscript) setUserPrompt((prev) => `${prev}${finalTranscript}`)
    }
    recognition.onerror = (event) => {
      console.error(`Erro no reconhecimento de voz: ${event.error}`)
    }
    recognitionRef.current = recognition
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      }
    }
  }, [setUserPrompt])

  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return
    recognition.onend = () => {
      if (listening) recognition.start()
    }
    if (listening) recognition.start()
    else recognition.stop()
  }, [listening])

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  // ... (código para usuário não logado) ...
  if (!signed) {
    return (
      <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
        <Button variant="secondary" size="icon" $rounded disabled>
          <Lock size={16} />
        </Button>
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <p className="text-lightFg-secondary dark:text-darkFg-secondary">Faça login ou crie sua conta para conversar.</p>
          <div className="flex gap-2">
            <Link to="/signup">
              <Button variant="outline" size="icon" $rounded>
                <UserPlus size={16} />
              </Button>
            </Link>
            <Link to="/signin">
              <Button variant="primary" size="icon" $rounded>
                <LogIn size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </Paper>
    )
  }

  return (
    <Paper className="relative bg-lightBg-primary dark:bg-darkBg-primary py-2 rounded-lg flex items-center gap-2 max-w-[95%] mb-2 mx-auto">
      {/* ADICIONADO: O input de arquivo real, que fica escondido mas é acionado por um botão. */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/flac, audio/mp3, audio/mp4, audio/mpeg, audio/mpga, audio/m4a, audio/ogg, audio/wav, audio/webm"
        style={{ display: "none" }}
      />
      {/* ... (código da UI mobile, as modificações são similares à da UI desktop) ... */}
      <div className="w-full hidden sm:flex items-center gap-2">
        {/* ... botões de Configurações, Provedor, Agentes, etc ... */}
        {/* MODIFICADO: Vários botões agora são desabilitados também durante o processamento de áudio */}
        <AIInput id="prompt-input-desktop" value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} onKeyDown={handleKeyDown} className="resize-y" disabled={loading || isProcessingAudio} />
        <div className="flex items-center gap-2">
          {/* ADICIONADO: Botão de gravação, que muda de ícone e função com base no estado 'isRecording'. */}
          <Button
            variant={isRecording ? "mic" : "secondary"}
            size="icon"
            $rounded
            title={isRecording ? "Parar Gravação" : "Gravar Áudio"}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={loading || isProcessingAudio}
          >
            {isRecording ? <Square size={16} /> : <Mic size={16} />}
          </Button>
          {/* ADICIONADO: Botão de upload, que mostra um spinner durante o processamento. */}
          <Button variant="secondary" size="icon" $rounded title="Upload de Áudio" onClick={handleUploadClick} disabled={loading || isProcessingAudio} loading={isProcessingAudio}>
              {!isProcessingAudio && <Upload size={16} />}
          </Button>
          <Button variant="secondary" size="icon" $rounded title="Nova Conversa" onClick={clearHistory} disabled={loading || isProcessingAudio}>
            <MessageCirclePlus size={16} />
          </Button>
        </div>
        {/* MODIFICADO: O botão de enviar também é desabilitado durante o processamento de áudio. */}
        <Button variant="primary" size="icon" $rounded title="Enviar" onClick={() => { setListening(false); handleSendMessage() }} loading={loading} disabled={loading || isProcessingAudio || (!userPrompt.trim() && imageCount === 0)}>
          {!loading && <Send size={16} />}
        </Button>
      </div>
    </Paper>
  )
}

export default AIBar
