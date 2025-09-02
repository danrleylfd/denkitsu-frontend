import axios from "axios"

const api = axios.create({ baseURL: "https://denkitsu.up.railway.app" })
api.interceptors.request.use((config) => {
  config.headers["Origin"] = "https://denkitsu.vercel.app"
  return config
})

export default api
