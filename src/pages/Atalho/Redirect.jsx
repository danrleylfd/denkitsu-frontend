import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { useAuth } from "../../contexts/AuthContext"
import { getLinkByLabel  } from "../../services/linker"

import SideMenu from "../../components/SideMenu"

const Redirect = () => {
  const { label } = useParams()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    const fetchLink = async () => {
      try {
        if(label === "signout") {
          signOut()
          return navigate("/signin")
        }
        const data = await getLinkByLabel(label)
        if (data.link) window.location.href = data.link
        else navigate("/")
      } catch (error) {
        console.error("Erro ao redirecionar:", error)
        navigate("/")
      }
    }
    fetchLink()
  }, [])
  return (
    <SideMenu>
      <h3>Redirecionando para {label || "Início"}...</h3>
    </SideMenu>
  )
}

export default Redirect
