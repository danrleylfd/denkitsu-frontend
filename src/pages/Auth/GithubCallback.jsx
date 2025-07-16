import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import SideMenu from "../../components/SideMenu"
import { Loader2 } from "lucide-react"

const GithubCallback = () => {
  const { completeOAuthSignIn } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get("token")
    const refreshToken = searchParams.get("refreshToken")
    const userParam = searchParams.get("user")

    if (token && userParam) {
      const user = JSON.parse(decodeURIComponent(userParam))
      // Chama a função do contexto para salvar os dados e logar o usuário
      completeOAuthSignIn({ token, refreshToken, user })
      // Redireciona para a página inicial, agora logado
      navigate("/")
    } else {
      // Se deu algo errado no backend, volta para a página de login
      navigate("/signin?error=auth_failed")
    }
  }, [searchParams, navigate, completeOAuthSignIn])

  return (
    <SideMenu>
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary-base" />
            <p className="text-lg">Finalizando autenticação...</p>
        </div>
    </SideMenu>
  )
}

export default GithubCallback
