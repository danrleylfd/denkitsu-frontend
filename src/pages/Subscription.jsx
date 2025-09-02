import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Crown, CheckCircle2, Star } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"
import api from "../services"
import SideMenu from "../components/SideMenu"
import Paper from "../components/Paper"
import Button from "../components/Button"

const ContentView = ({ children }) => (
  <main className="flex justify-center items-center p-2 gap-2 w-full min-h-dvh">
    {children}
  </main>
)

const ProFeature = ({ children }) => (
  <li className="flex items-center gap-3">
    <Star size={16} className="text-amber-base flex-shrink-0" />
    <span className="text-lightFg-secondary dark:text-darkFg-secondary">{children}</span>
  </li>
)

const Subscription = () => {
  const { user } = useAuth()
  const { notifyError, notifySuccess, notifyInfo } = useNotification()
  const [loadingStripe, setLoadingStripe] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get("payment_success")) {
      notifySuccess("Assinatura confirmada! Bem-vindo ao Plano Pro.")
      setSearchParams({})
    }
    if (searchParams.get("payment_canceled")) {
      notifyInfo("O processo de assinatura foi cancelado.")
      setSearchParams({})
    }
  }, [searchParams, setSearchParams, notifySuccess, notifyInfo])

  const handleUpgrade = async () => {
    setLoadingStripe(true)
    try {
      const { data } = await api.post("/stripe/create-checkout-session")
      if (data.url) window.location.href = data.url
    } catch (error) {
      notifyError("Não foi possível iniciar o processo de assinatura. Tente novamente.")
    } finally {
      setLoadingStripe(false)
    }
  }

  const handleManageSubscription = async () => {
    setLoadingStripe(true)
    try {
      const { data } = await api.post("/stripe/create-customer-portal")
      if (data.url) window.location.href = data.url
    } catch (error) {
      notifyError("Não foi possível acessar o portal do cliente. Tente novamente.")
    } finally {
      setLoadingStripe(false)
    }
  }

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-brand-purple">
      <Paper className="w-full max-w-md flex flex-col items-center gap-4 text-center bg-lightBg-primary dark:bg-darkBg-primary">
        <div className="w-16 h-16 rounded-full bg-amber-base/10 flex items-center justify-center border-2 border-amber-base">
          <Crown size={32} className="text-amber-base" />
        </div>
        {user?.plan === "pro" ? (
          <>
            <h2 className="text-2xl font-bold text-lightFg-primary dark:text-darkFg-primary">Você é um Membro Pro!</h2>
            <div className="flex items-center gap-2 text-green-base font-semibold bg-green-base/10 px-4 py-2 rounded-full">
              <CheckCircle2 size={20} />
              <span>Assinatura Ativa</span>
            </div>
            <p className="text-lightFg-secondary dark:text-darkFg-secondary">
              Obrigado por apoiar o Denkitsu. Gerencie sua assinatura, altere seu método de pagamento ou visualize seu histórico de faturas no portal do cliente.
            </p>
            <Button variant="primary" $rounded onClick={handleManageSubscription} loading={loadingStripe} disabled={loadingStripe}>
              Gerenciar Assinatura
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-lightFg-primary dark:text-darkFg-primary">Eleve sua Experiência com o Plano Pro</h2>
            <p className="text-lightFg-secondary dark:text-darkFg-secondary">
              Desbloqueie todo o potencial do Denkitsu com acesso ilimitado e funcionalidades exclusivas.
            </p>
            <div className="text-left w-full bg-lightBg-secondary dark:bg-darkBg-secondary p-4 rounded-lg">
              <h3 className="font-bold mb-3 text-lightFg-primary dark:text-darkFg-primary">Benefícios do Plano Pro:</h3>
              <ul className="space-y-2">
                <ProFeature>Acesso a todos os modelos de IA premium (GPT-4, Claude 3, etc.).</ProFeature>
                <ProFeature>Criação ilimitada de Agentes personalizados.</ProFeature>
                <ProFeature>Criação ilimitada de Ferramentas customizadas.</ProFeature>
                <ProFeature>Acesso antecipado a novas funcionalidades.</ProFeature>
              </ul>
            </div>
            <Button variant="primary" $rounded onClick={handleUpgrade} loading={loadingStripe} disabled={loadingStripe}>
              Fazer Upgrade para o Plano Pro
            </Button>
          </>
        )}
      </Paper>
    </SideMenu>
  )
}

export default Subscription
