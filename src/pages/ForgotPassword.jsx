import { useState } from "react"

import api from "../services"

import SideMenu from "../components/SideMenu"
import Form from "../components/Form"
import Button from "../components/Button"
import Input from "../components/Input"
import { MessageBase, MessageError } from "../components/Notifications"

const ContentView = ({ children }) => (
  <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full h-screen" data-oid="rl60tye">
    {children}
  </main>
)

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const handleForgotPassword = async () => {
    setError(null)
    setMessage("")
    if (!email) return setError("Por favor, insira seu email.")
    setLoading(true)
    try {
      await api.post("/auth/forgot_password", { email })
      setMessage("Email enviado com sucesso! Verifique sua caixa de entrada.")
      setEmail("")
    } catch (err) {
      setError(err.response?.data?.error || "Falha ao enviar email. Verifique o endereço informado.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-[url('/background.jpg')] bg-brand-purple" data-oid="h5n0m:i">
      <Form title="Recuperar Conta" onSubmit={handleForgotPassword} data-oid="j3dkr4:">
        <p className="text-sm text-gray-200 -mt-2 mb-4" data-oid="md3m1c.">
          Digite seu email para receber o link de recuperação.
        </p>
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
          data-oid="m5ngf-p"
        />
        <Button type="submit" $rounded loading={loading} disabled={loading || !email} data-oid="9_s-es9">
          {!loading && "Enviar Email"}
        </Button>
        {message && <MessageBase data-oid="w14q9:j">{message}</MessageBase>}
        {error && <MessageError data-oid="67hv_vo">{error}</MessageError>}
      </Form>
    </SideMenu>
  )
}

export default ForgotPassword
