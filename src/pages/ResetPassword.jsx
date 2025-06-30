import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { LuEye, LuEyeClosed } from "react-icons/lu"

import api from "../services"

import Form from "../components/Form"
import SideMenu from "../components/SideMenu"
import Input from "../components/Input"
import Button from "../components/Button"
import { MessageBase, MessageError } from "../components/Notifications"

const ContentView = ({ children }) => (
  <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full h-screen" data-oid="cx5yd9v">
    {children}
  </main>
)

const ResetPassword = () => {
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState(null)
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
    setError(null)
    setMessage("")
    if (!token || !email || !password || !confirmPassword) return setError("Por favor, preencha todos os campos.")
    if (password !== confirmPassword) return setError("As senhas não coincidem.")
    if (password.length < 8) return setError("A senha deve ter pelo menos 8 caracteres.")
    setLoading(true)
    try {
      await api.post("/auth/reset_password", { token, email, password })
      setMessage("Senha redefinida com sucesso! Você será redirecionado para o login.")
      setTimeout(() => navigate("/"), 3000)
    } catch (err) {
      setError(err.response?.data?.error || "Falha ao redefinir a senha. Verifique o token e o email informados.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple" data-oid="kc1hx1o">
      <Form title="Redefinir Senha" onSubmit={handleResetPassword} data-oid="vs.ltj7">
        <Input
          name="token"
          type="text"
          placeholder="Token de Recuperação"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoComplete="token"
          disabled={loading}
          data-oid="7uynwv5"
        />
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
          data-oid="ss:4rr2"
        />
        <Input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Nova Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          disabled={loading}
          data-oid="9-aae_8">
          <Button type="button" variant="outline" size="icon" $rounded onClick={() => setShowPassword(!showPassword)} disabled={loading} data-oid="yf8dee6">
            {showPassword ? <LuEye size={16} data-oid="qc37o01" /> : <LuEyeClosed size={16} data-oid="lg.pol-" />}
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
          data-oid="-uq6t60"
        />
        <Button type="submit" $rounded loading={loading} data-oid="ju3f3l4">
          {!loading && "Redefinir Senha"}
        </Button>
        {message && <MessageBase data-oid="jxn8qc9">{message}</MessageBase>}
        {error && <MessageError data-oid="v9-:vpl">{error}</MessageError>}
      </Form>
    </SideMenu>
  )
}

export default ResetPassword
