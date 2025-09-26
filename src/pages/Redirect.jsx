import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"

import { getLinkByLabel } from "../services/linker"

const Redirect = () => {
  const { label } = useParams()
  const { notifyError } = useNotification()
  const navigate = useNavigate()

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const data = await getLinkByLabel(label)
        if (data.link) window.location.href = data.link
        else navigate("/")
      } catch (err) {
        if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
        else notifyError("Ocorreu um erro ao processar este atalho.")
        setTimeout(() => { navigate("/") }, 3000)
      }
    }
    if (label) handleRedirect()
    else navigate("/")
  }, [])

  return (
    <div className="flex flex-1 mt-2 justify-center items-center">
      <h3 className="text-lightFg-primary dark:text-darkFg-primary">
        Redirecionando para {label || "Início"}...
      </h3>
    </div>
  )
}

export default Redirect
