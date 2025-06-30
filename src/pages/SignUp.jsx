import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LuEye, LuEyeClosed } from "react-icons/lu"

import { useAuth } from "../contexts/AuthContext"

import SideMenu from "../components/SideMenu"
import Form from "../components/Form"
import Input from "../components/Input"
import Button from "../components/Button"
import { MessageError } from "../components/Notifications"

const ContentView = ({ children }) => (
  <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full h-screen">
    {children}
  </main>
)

const SignUp = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const handleSignUp = async () => {
    setError(null)
    if (!name || !email || !password || !confirmPassword) return setError("Por favor, preencha todos os campos.")
    if (password !== confirmPassword) return setError("As senhas não coincidem.")
    if (password.length < 8) return setError("A senha deve ter pelo menos 8 caracteres.")
    setLoading(true)
    try {
      await signUp({ name, email, password })
      navigate("/signin")
    } catch (err) {
      setError(err.response?.data?.error || "Falha ao cadastrar. Verifique os dados informados.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple">
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
            {showPassword ? <LuEye size={16} /> : <LuEyeClosed size={16} />}
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
        {error && <MessageError>{error}</MessageError>}
      </Form>
    </SideMenu>
  )
}

export default SignUp
