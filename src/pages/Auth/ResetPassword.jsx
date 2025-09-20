import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Eye, EyeClosed } from "lucide-react"

import { useNotification } from "../../contexts/NotificationContext"

import api from "../../services"

import Form from "../../components/Form"
import SideMenu from "../../components/SideMenu"
import Input from "../../components/Input"
import Button from "../../components/Button"

const ContentView = ({ children }) => (
  <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full h-dvh">
    {children}
  </main>
)

const ResetPassword = () => {
  const { notifyInfo, notifyWarning, notifyError } = useNotification()
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const urlToken = searchParams.get("token")
    const urlEmail = searchParams.get("email")
    if (urlToken) setToken(urlToken)
    if (urlEmail) setEmail(urlEmail)
  }, [searchParams])

  const handleResetPassword = async () => {
    if (!token || !email || !password || !confirmPassword) return notifyWarning("Por favor, preencha todos os campos.")
    if (password !== confirmPassword) return notifyWarning("As senhas não coincidem.")
    if (password.length < 8) return notifyWarning("A senha deve ter pelo menos 8 caracteres.")
    setLoading(true)
    try {
      await api.post("/auth/reset_password", { token, email, password })
      notifyInfo("Senha redefinida com sucesso! Você será redirecionado para o login.")
      setTimeout(() => navigate("/signin"), 3000)
    } catch (err) {
      if (err.response && err.response.data.error) {
        notifyError(err.response.data.error.message)
      } else {
        notifyError("Ocorreu um erro inesperado ao redefinir a senha.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Form title="Redefinir Senha" onSubmit={handleResetPassword}>
        <Input
          name="token"
          type="text"
          placeholder="Token de Recuperação"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoComplete="token"
          disabled={loading}
        />
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
          placeholder="Nova Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          disabled={loading}>
          <Button type="button" variant="outline" size="icon" $rounded onClick={() => setShowPassword(!showPassword)} disabled={loading}>
            {showPassword ? <Eye size={16} /> : <EyeClosed size={16} />}
          </Button>
        </Input>
        <Input
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Confirmar Nova Senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          disabled={loading}
        />
        <Button type="submit" $rounded loading={loading}>
          {!loading && "Redefinir Senha"}
        </Button>
      </Form>
    </>
  )
}

export default ResetPassword
