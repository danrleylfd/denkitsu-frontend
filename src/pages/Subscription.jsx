import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Crown, CheckCircle2, Star } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"
import { getUserAccount } from "../services/account"
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
  const { user, updateUser } = useAuth()
  const { notifyError, notifySuccess, notifyInfo } = useNotification()
  const [loadingStripe, setLoadingStripe] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      notifySuccess("Assinatura confirmada! Bem-vindo ao Plano Pro.")
      try {
        const freshUserData = await getUserAccount()
        updateUser(freshUserData)
      } catch (error) {
        console.error("Falha ao atualizar dados do usuário após assinatura.", error)
        notifyError("Sua assinatura está ativa, mas houve um erro ao atualizar a página. Por favor, recarregue.")
      } finally {
        setSearchParams({})
      }
    }
    if (searchParams.get("payment_success")) handlePaymentSuccess()
    if (searchParams.get("payment_canceled")) {
      notifyInfo("O processo de assinatura foi cancelado.")
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  const handleSubscriptionAction = async () => {
    setLoadingStripe(true)
    try {
      const { data } = await api.post("/stripe/create-checkout-session")
      if (data.type === "reactivation" && data.user) {
        // Se foi reativação, atualiza o estado local!
        updateUser(data.user)
        notifySuccess("Sua assinatura foi reativada com sucesso!")
      } else if (data.type === "checkout" && data.url) {
        // Se for um novo checkout, redireciona.
        window.location.href = data.url
      } else if (data.url) {
        // Fallback para o portal do cliente.
        window.location.href = data.url
      }
    } catch (error) {
      notifyError("Não foi possível gerenciar sua assinatura. Tente novamente.")
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
            {user.subscriptionCancelAtPeriodEnd ? (
              <div className="w-full p-3 rounded-lg bg-amber-base/10 text-amber-dark dark:text-amber-light flex flex-col items-center gap-2">
                <AlertTriangle size={20} />
                <p className="font-semibold">Sua assinatura está agendada para cancelar em {new Date(user.proAccessUntil).toLocaleDateString()}.</p>
                <span className="text-xs">Você pode reativá-la a qualquer momento antes dessa data.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-base font-semibold bg-green-base/10 px-4 py-2 rounded-full">
                <CheckCircle2 size={20} />
                <span>Assinatura Ativa</span>
              </div>
            )}
            <p className="text-lightFg-secondary dark:text-darkFg-secondary">
              Obrigado por apoiar o Denkitsu. Gerencie sua assinatura, altere seu método de pagamento ou visualize seu histórico de faturas no portal do cliente.
            </p>
            <Button variant="primary" $rounded onClick={handleManageSubscription} loading={loadingStripe} disabled={loadingStripe}>
              {user.subscriptionCancelAtPeriodEnd ? "Reativar ou Gerenciar Assinatura" : "Gerenciar Assinatura"}
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-lightFg-primary dark:text-darkFg-primary">Eleve sua Experiência</h2>
            <p className="text-lightFg-secondary dark:text-darkFg-secondary">
              {user?.stripeSubscriptionId ? "Sua assinatura está cancelada, mas você ainda tem acesso Pro. Reative para garantir a renovação." : "Desbloqueie todo o potencial do Denkitsu com acesso ilimitado e funcionalidades exclusivas."}
            </p>
            <div className="text-left w-full bg-lightBg-secondary dark:bg-darkBg-secondary p-4 rounded-lg">
              <h5 className="text-lightFg-primary dark:text-darkFg-primary pb-2">Benefícios</h5>
              <ul className="space-y-2">
                <ProFeature>Acesso a todos os modelos de IA premium.</ProFeature>
                <ProFeature>Fabricação ilimitada de Agentes personalizados.</ProFeature>
                <ProFeature>Fabricação ilimitada de Ferramentas customizadas.</ProFeature>
              </ul>
            </div>
            <Button variant="primary" $rounded onClick={handleSubscriptionAction} loading={loadingStripe} disabled={loadingStripe}>
              {!loadingStripe && (user?.stripeSubscriptionId ? "Reativar Assinatura" : "Assinar por R$ 15,00/mês")}
            </Button>
          </>
        )}
      </Paper>
    </SideMenu>
  )
}

export default Subscription
