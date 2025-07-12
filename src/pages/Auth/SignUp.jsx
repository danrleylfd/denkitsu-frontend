import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeClosed } from "lucide-react"

import { useAuth } from "../../contexts/AuthContext"
import { useNotification } from "../../contexts/NotificationContext"

import SideMenu from "../../components/SideMenu"
import Form from "../../components/Form"
import Input from "../../components/Input"
import Button from "../../components/Button"

const ContentView = ({ children }) => (
  <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full h-screen">
    {children}
  </main>
)

const SignUp = () => {
  const { signUp } = useAuth()
  const { notifyWarning, notifyError } = useNotification()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) return notifyWarning("Por favor, preencha todos os campos.")
    if (password !== confirmPassword) return notifyWarning("As senhas não coincidem.")
    if (password.length < 8) return notifyWarning("A senha deve ter pelo menos 8 caracteres.")
    setLoading(true)
    try {
      await signUp({ name, email, password })
      navigate("/signin")
    } catch (err) {
      console.error(err.response?.data?.error || err)
      notifyError("Falha ao cadastrar. Verifique os dados informados.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-brand-purple">
      <Form title="Cadastrar" onSubmit={handleSignUp}>
        <Input
          name="name"
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
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
          placeholder="Senha (mín. 8 caracteres)"
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
          placeholder="Confirmar Senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          disabled={loading}
        />
        <Button type="submit" $rounded loading={loading} disabled={loading}>
          {!loading && "Cadastrar"}
        </Button>
      </Form>
    </SideMenu>
  )
}

export default SignUp
