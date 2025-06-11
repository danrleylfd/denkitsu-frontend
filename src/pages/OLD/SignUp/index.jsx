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

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError(null)
    if (!name || !email || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos.")
      return
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.")
      return
    }
    setLoading(true)
    try {
      await signUp({ name, email, password })
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.error || "Falha ao cadastrar. Verifique os dados informados.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SideMenu ContentView={SideContentContainer}>
      <Form title="Cadastrar">
        <Input name="name" type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" disabled={loading}/>
        <Input name="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={loading}/>
        <Input name="password" type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" disabled={loading}>
          <Button variant="outline" size="icon" $rounded onClick={() => setShowPassword(!showPassword)} disabled={loading}>
            {showPassword ? <LuEye size={16}/> : <LuEyeClosed size={16}/>}
          </Button>
        </Input>
        <Input name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Confirmar Senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" disabled={loading}>
          <Button variant="outline" size="icon" $rounded onClick={() => setShowPassword(!showPassword)} disabled={loading}>
            {showPassword ? <LuEye size={16}/> : <LuEyeClosed size={16}/>}
          </Button>
        </Input>
        <Button type="submit" $rounded onClick={handleSignUp} loading={loading}>
          {!loading && "Cadastrar"}
        </Button>
        {error && <MessageError>{error}</MessageError>}
        {/* <Link to="/signin">Já tem uma conta? Entre</Link> */}
      </Form>
    </SideMenu>
  )
}

export default SignUp
