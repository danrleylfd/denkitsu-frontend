import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { useAuth } from "../contexts/AuthContext"
import { getLinkByLabel  } from "../services/linker"

import SideMenu from "../components/SideMenu"

const ContentView = ({ children }) => (
  <main className="flex flex-col justify-center items-center p-2 gap-2 mx-auto h-screen w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto">{children}</main>
)

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
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple">
      <h3>Redirecionando para {label || "Início"}...</h3>
    </SideMenu>
  )
}

export default Redirect
