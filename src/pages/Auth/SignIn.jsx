import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeClosed, Github } from "lucide-react"

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

const SignIn = () => {
  const { signIn } = useAuth()
  const { notifyError } = useNotification()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const backendGithubAuthUrl = "https://denkitsu.up.railway.app/auth/github"

  const handleSignIn = async () => {
    if (!email || !password) return notifyError("Por favor, preencha todos os campos.")

    setLoading(true)
    try {
      await signIn({ email, password })
      navigate("/")
    } catch (err) {
      console.error(err.response?.data?.error || err)
      notifyError("Falha ao entrar. Verifique suas credenciais.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <Form title="Entrar" onSubmit={handleSignIn}>
        <a href={backendGithubAuthUrl} className="w-full">
          <Button type="button" variant="secondary" className="w-full" $rounded>
            <Github size={16} className="mr-2"/> Entrar com GitHub
          </Button>
        </a>
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
        <Button type="submit" $rounded loading={loading} disabled={loading || !email || !password}>
          {!loading && "Entrar"}
        </Button>
      </Form>
    </SideMenu>
  )
}

export default SignIn
