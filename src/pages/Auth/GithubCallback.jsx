import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import SideMenu from "../../components/SideMenu"
import { Loader2 } from "lucide-react"

const GithubCallback = () => {
  const { signWithOAuth, updateUser } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const signWithGithub = async () => {
      const token = searchParams.get("token")
      const refreshToken = searchParams.get("refreshToken")
      const userParam = searchParams.get("user")
      if (token && userParam) {
        const user = JSON.parse(decodeURIComponent(userParam))
        await signWithOAuth({ token, refreshToken, user })
        await updateUser(user._id)
        navigate("/")
      } else navigate("/signin?error=auth_failed")
    }
    signWithGithub()
  }, [searchParams, navigate, signWithOAuth, updateUser])

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
