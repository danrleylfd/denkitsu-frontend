import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LuEye, LuEyeClosed } from "react-icons/lu"

import { useAuth } from "../../../contexts/AuthContext"

import SideMenu from "../../../components/SideMenu"
import Form from "../../../components/Form"
import Input from "../../../components/Input"
import Button from "../../../components/Button"
import { MessageError } from "../../../components/Notifications"

import { SideContentContainer } from "./styles"

const SignIn = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSignIn = async () => {
    setError(null)
    if (!email || !password) {
      setError("Por favor, preencha todos os campos.")
      return
    }
    setLoading(true)
    try {
      await signIn({ email, password })
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.error || "Falha ao entrar. Verifique suas credenciais.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SideMenu ContentView={SideContentContainer}>
      <Form title="Entrar">
        <Input name="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={loading}/>
        <Input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          disabled={loading}>
            <Button variant="outline" size="icon" $rounded onClick={() => setShowPassword(!showPassword)} disabled={loading}>
              {showPassword ? <LuEye size={16}/> : <LuEyeClosed size={16}/>}
            </Button>
          </Input>
        <Button type="submit" $rounded onClick={handleSignIn} loading={loading}>
          {!loading && "Entrar"}
        </Button>
        {error && <MessageError>{error}</MessageError>}
        {/* <Link to="/forgot_password">Esqueceu a senha?</Link>
        <Link to="/signup">Não tem uma conta? Cadastre-se</Link> */}
      </Form>
    </SideMenu>
  )
}

export default SignIn
