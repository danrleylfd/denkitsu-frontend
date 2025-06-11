import { useState } from "react"
import { Link } from "react-router-dom"

import api from "../../../services"

import SideMenu from "../../../components/SideMenu"
import Form from "../../../components/Form"
import Button from "../../../components/Button"
import Input from "../../../components/Input"
import { MessageBase, MessageError } from "../../../components/Notifications"

import { SideContentContainer } from "./styles"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage("")
    if (!email) {
      setError("Por favor, insira seu email.")
      return
    }
    setLoading(true)
    try {
      await api.post("/auth/forgot_password", { email })
      setMessage("Email enviado com sucesso! Verifique sua caixa de entrada para o token de recuperação.")
      setEmail("")
    } catch (err) {
      setError(err.response?.data?.error || "Falha ao enviar email de recuperação. Verifique o email informado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SideMenu ContentView={SideContentContainer}>
      <Form title="Recuperar Conta">
        <Input name="email" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={loading}/>
        <Button type="submit" $rounded onClick={handleForgotPassword} loading={loading}>
          {!loading && "Enviar Email"}
        </Button>
        {message && <MessageBase>{message}</MessageBase>}
        {error && <MessageError>{error}</MessageError>}
        {/* <Link to="/signin">Lembrou a senha?</Link>
        <Link to="/signup">Não tem uma conta? Cadastre-se</Link> */}
      </Form>
    </SideMenu>
  )
}

export default ForgotPassword
