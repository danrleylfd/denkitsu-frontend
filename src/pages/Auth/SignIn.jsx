import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeClosed, Github } from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"

import Form from "../../components/Form"
import Input from "../../components/Input"
import Button from "../../components/Button"

const SignIn = () => {
  const { signIn } = useAuth()
  const { notifyError } = useNotification()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const backendGithubAuthUrl = "https://denkitsu.up.railway.app/auth/github"

  useEffect(() => {
    const errorCode = searchParams.get("error_code")
    if (errorCode) {
      const errorMessages = {
        GITHUB_CODE_MISSING: "O GitHub não retornou um código de autorização.",
        GITHUB_TOKEN_FETCH_FAILED: "Falha na comunicação com o GitHub. Tente novamente.",
        GITHUB_ACCOUNT_IN_USE: "Esta conta do GitHub já está vinculada a outro usuário.",
        GITHUB_AUTH_FAILED: "Ocorreu um erro inesperado durante a autenticação com o GitHub.",
        USER_LINK_NOT_FOUND: "Usuário para vincular não encontrado."
      }
      const message = errorMessages[errorCode] || errorMessages.GITHUB_AUTH_FAILED
      notifyError(message)
    }
  }, [searchParams])

  const handleSignIn = async () => {
    if (!email || !password) return notifyError("Por favor, preencha todos os campos.")
    setLoading(true)
    try {
      await signIn({ email, password })
      navigate("/")
    } catch (err) {
      if (err.response && err.response.data.error) notifyError(err.response.data.error.message)
      else notifyError("Não foi possível conectar ao servidor. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 justify-center items-center">
      <Form title="Entrar" onSubmit={handleSignIn}>
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
        />
        <Input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading}>
          <Button type="button" variant="outline" size="icon" $rounded onClick={() => setShowPassword(!showPassword)} disabled={loading}>
            {showPassword ? <Eye size={16} /> : <EyeClosed size={16} />}
          </Button>
        </Input>
        <div className="flex w-full gap-2 justify-center items-center">
          <Button type="submit" $rounded loading={loading} disabled={loading || !email || !password}>
            {!loading && "Entrar"}
          </Button>
          <a href={backendGithubAuthUrl}>
            <Button type="button" variant="secondary" size="icon" title="Entrar com Github" $rounded>
              <Github size={16} />
            </Button>
          </a>
        </div>
      </Form>
    </div>
  )
}

export default SignIn
