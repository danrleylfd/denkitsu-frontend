import { useState } from "react"

import api from "../../services"

import { useNotification } from "../../contexts/NotificationContext"

import SideMenu from "../../components/SideMenu"
import Form from "../../components/Form"
import Button from "../../components/Button"
import Input from "../../components/Input"

const ContentView = ({ children }) => (
  <main className="flex flex-1 flex-col justify-center items-center p-2 gap-2 w-full h-dvh">
    {children}
  </main>
)

const ForgotPassword = () => {
  const { notifyInfo, notifyWarning, notifyError } = useNotification()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleForgotPassword = async () => {
    if (!email) return notifyWarning("Por favor, insira seu email.")
    setLoading(true)
    try {
      await api.post("/auth/forgot_password", { email })
      notifyInfo("E-mail de recuperação enviado! Verifique sua caixa de entrada e spam.")
      setEmail("")
    } catch (err) {
      if (err.response && err.response.data.error) {
        notifyError(err.response.data.error.message)
      } else {
        notifyError("Ocorreu um erro inesperado.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-1 justify-center items-center">
      <Form title="Recuperar Conta" onSubmit={handleForgotPassword}>
        <p className="text-sm text-gray-200 -mt-2 mb-4">
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
        />
        <Button type="submit" $rounded loading={loading} disabled={loading || !email}>
          {!loading && "Enviar Email"}
        </Button>
      </Form>
    </div>
  )
}

export default ForgotPassword
