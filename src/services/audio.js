import api from "./"

const transcribeAudio = async (audioBlob) => {
  const formData = new FormData()
  formData.append("audio", audioBlob, "recording.webm")
  try {
    const response = await api.post("/audio/transcribe", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data.transcription
  } catch (error) {
    console.error("Error on transcribeAudio:", error.response?.data?.error?.message || error.message)
    throw error
  }
}

export { transcribeAudio }
