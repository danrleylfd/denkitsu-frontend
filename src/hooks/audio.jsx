import { useState, useRef, useEffect, useCallback } from "react"
import { useNotification } from "../contexts/NotificationContext"

const useAudio = (props) => {
  const { setAudioFile, setUserPrompt, listening } = props
  const { notifyError, notifyInfo } = useNotification()

  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)

  const handleStartRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioFile(audioBlob)
        notifyInfo("Gravação pronta para enviar.")
        audioChunksRef.current = []
        stream.getTracks().forEach(track => track.stop())
      }
      mediaRecorderRef.current.start()
      setRecording(true)
    } catch (err) {
      notifyError("Não foi possível acessar o microfone.")
    }
  }, [setAudioFile])

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }, [])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        notifyError("O arquivo de áudio não pode exceder 25 MB.")
        return
      }
      setAudioFile(file)
    }
    event.target.value = ""
  }, [setAudioFile])

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
    if (listening) {
      recognition.start()
    } else {
      recognition.stop()
    }
  }, [listening])


  return {
    recording,
    fileInputRef,
    handleStartRecording,
    handleStopRecording,
    handleUploadClick,
    handleFileChange,
  }
}

export default useAudio
