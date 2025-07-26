import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"

import { getLinkByLabel } from "../services/linker"

import SideMenu from "../components/SideMenu"

const ContentView = ({ children }) => (
  <main
    className="flex flex-col justify-center items-center p-2 gap-2 mx-auto h-dvh w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

const Redirect = () => {
  const { label } = useParams()
  const { signOut } = useAuth()
  const { notifyError } = useNotification()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLink = async () => {
      try {
        if (label === "signout") {
          signOut()
          navigate("/signin")
          return
        }
        const data = await getLinkByLabel(label)
        if (data.link) {
          window.location.href = data.link
        } else {
          navigate("/")
        }
      } catch (err) {
        if (err.response && err.response.data.error) {
          notifyError(err.response.data.error.message)
        } else {
          notifyError("Ocorreu um erro ao processar este atalho.")
        }
        setTimeout(() => {
          navigate("/")
        }, 3000)
      }
    }

    fetchLink()
  }, [label, signOut, navigate, notifyError])

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <h3 className="text-lightFg-primary dark:text-darkFg-primary">
        Redirecionando...
      </h3>
    </SideMenu>
  )
}

export default Redirect
