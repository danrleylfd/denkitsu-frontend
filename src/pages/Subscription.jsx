import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Crown, CheckCircle2, Star, AlertTriangle } from "lucide-react"

import { useAuth } from "../contexts/AuthContext"
import { useNotification } from "../contexts/NotificationContext"

import api from "../services"

import SideMenu from "../components/SideMenu"
import Paper from "../components/Paper"
import Button from "../components/Button"

const ContentView = ({ children }) => <main className="flex justify-center items-center p-2 gap-2 w-full min-h-dvh">{children}</main>

const ProFeature = ({ children }) => (
  <li className="flex items-center gap-3">
    <Star size={16} className="text-amber-base flex-shrink-0" />
    <span className="text-lightFg-secondary dark:text-darkFg-secondary">{children}</span>
  </li>
)

const Subscription = () => {
  const { user, updateUser } = useAuth()
  const { notifyError, notifySuccess, notifyInfo } = useNotification()
  const [loadingAction, setLoadingAction] = useState(false)
  const [loadingCancel, setLoadingCancel] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      notifySuccess("Assinatura confirmada! Bem-vindo ao Plano Plus.")
      try {
        updateUser()
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
    setLoadingAction(true)
    try {
      await api.post("/stripe/create-checkout-session")
      if (data.type === "reactivation" && data.user) {
        updateUser()
        notifySuccess("Sua assinatura foi reativada com sucesso!")
      } else if (data.type === "checkout" && data.url) window.location.href = data.url
      else if (data.url) window.location.href = data.url
    } catch (error) {
      notifyError("Não foi possível gerenciar sua assinatura. Tente novamente.")
    } finally {
      setLoadingAction(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!window.confirm("Tem certeza que deseja cancelar sua assinatura? Você manterá o acesso Plus até o final do período de cobrança.")) return
    setLoadingCancel(true)
    try {
      await api.post("/stripe/cancel-subscription")
      updateUser()
      notifySuccess("Sua assinatura foi agendada para cancelamento com sucesso.")
    } catch (error) {
      notifyError(error.response?.data?.error || "Não foi possível cancelar sua assinatura. Tente novamente.")
    } finally {
      setLoadingCancel(false)
    }
  }

  const renderContent = () => {
    if (user?.plan ===  "plus" && user?.stripeSubscriptionStatus === "active") {
      if (user.subscriptionCancelAtPeriodEnd) {
        return (
          <>
            <h2 className="text-lightFg-primary dark:text-darkFg-primary">Reative sua Assinatura</h2>
            <div className="flex items-center gap-2 text-amber-base font-semibold bg-amber-base/10 px-4 py-2 rounded-full">
              <AlertTriangle size={20} />
              <span>Cancelamento Agendado</span>
            </div>
            <p className="text-lightFg-secondary dark:text-darkFg-secondary">
              Seu acesso Plus continua ativo até o final do período de faturamento. Para não perder seus benefícios, reative sua assinatura.
            </p>
            <Button variant="primary" $rounded onClick={handleSubscriptionAction} loading={loadingAction} disabled={loadingAction || loadingCancel}>
              {!loadingAction && "Reativar Assinatura"}
            </Button>
          </>
        )
      }
      return (
        <>
          <h2 className="text-lightFg-primary dark:text-darkFg-primary">Acesso Desbloqueado!</h2>
          <div className="flex items-center gap-2 text-green-base font-semibold bg-green-base/10 px-4 py-2 rounded-full">
            <CheckCircle2 size={20} />
            <span>Assinatura Ativa</span>
          </div>
          <p className="text-lightFg-secondary dark:text-darkFg-secondary">
            Obrigado por apoiar o Denkitsu. Gerencie sua assinatura, altere seu método de pagamento ou visualize seu histórico de faturas no portal do cliente.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" $rounded onClick={handleCancelSubscription} loading={loadingCancel} disabled={loadingAction || loadingCancel}>
              {!loadingCancel && "Cancelar Assinatura"}
            </Button>
            <Button variant="primary" $rounded onClick={handleSubscriptionAction} loading={loadingAction} disabled={loadingAction || loadingCancel}>
              {!loadingAction && "Gerenciar Assinatura"}
            </Button>
          </div>
        </>
      )
    }

    return (
      <>
        <h2 className="text-lightFg-primary dark:text-darkFg-primary">Eleve sua Experiência</h2>
        <p className="text-lightFg-secondary dark:text-darkFg-secondary">
          {user?.stripeSubscriptionId
            ? "Sua assinatura não está mais ativa. Renove para continuar com os benefícios do Plano Plus."
            : "Desbloqueie todo o potencial do Denkitsu com acesso ilimitado e funcionalidades exclusivas."}
        </p>
        <div className="text-left w-full bg-lightBg-secondary dark:bg-darkBg-secondary p-4 rounded-lg">
          <h5 className="text-lightFg-primary dark:text-darkFg-primary pb-2">Benefícios</h5>
          <ul className="space-y-2">
            <ProFeature>Provedores de IA personalizados.</ProFeature>
            <ProFeature>Fabricação/Aquisição ilimitada de Agentes e Ferramentas.</ProFeature>
          </ul>
        </div>
        <Button variant="primary" $rounded onClick={handleSubscriptionAction} loading={loadingAction} disabled={loadingAction}>
          {!loadingAction && (user?.stripeSubscriptionId ? "Renovar Assinatura" : "Simular Assinatura")}
        </Button>
      </>
    )
  }

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-brand-purple">
      <Paper className="w-full max-w-md flex flex-col items-center gap-4 text-center bg-lightBg-primary dark:bg-darkBg-primary">
        <div className="w-16 h-16 rounded-full bg-amber-base/10 flex items-center justify-center border-2 border-amber-base">
          <Crown size={32} className="text-amber-base" />
        </div>
        {renderContent()}
      </Paper>
    </SideMenu>
  )
}

export default Subscription
