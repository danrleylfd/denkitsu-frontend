// Frontend (ESM)
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
  const { user, loadUser, updateUser } = useAuth()
  const { notifyError, notifySuccess, notifyInfo } = useNotification()
  const [loadingAction, setLoadingAction] = useState(false)
  const [loadingCancel, setLoadingCancel] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      notifySuccess("Assinatura confirmada! Bem-vindo ao Plano Plus.")
      try {
        await loadUser()
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
  }, [searchParams, setSearchParams, loadUser, notifySuccess, notifyError, notifyInfo])

  const handleSubscriptionAction = async () => {
    setLoadingAction(true)
    try {
      const { data } = await api.post("/stripe/create-checkout-session")
      if (data.type === "reactivation" && data.user) {
        await updateUser(data.user)
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
      const { data } = await api.post("/stripe/cancel-subscription")
      await updateUser(data.user)
      notifySuccess("Sua assinatura foi agendada para cancelamento com sucesso.")
    } catch (error) {
      notifyError(error.response?.data?.error?.message || "Não foi possível cancelar sua assinatura. Tente novamente.")
    } finally {
      setLoadingCancel(false)
    }
  }

  const renderContent = () => {
    // Cenário 1: Usuário é 'plus' e a assinatura está ativa
    if (user?.plan === "plus" && user?.stripeSubscriptionStatus === "active") {
      // Cenário 1.1: A assinatura está agendada para cancelar no fim do período
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
              {!loadingAction && "Cancelar Agendamento"}
            </Button>
          </>
        )
      }
      // Cenário 1.2: Assinatura totalmente ativa
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

    // Cenário 2: Usuário não é 'plus' (plano 'free' ou outro status)
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
          {!loadingAction && (user?.plan === "free" && (user?.stripeSubscriptionStatus === "past_due" || user?.stripeSubscriptionStatus === "canceled") ? "Renovar Assinatura" : "Simular Assinatura")}
        </Button>
      </>
    )
  }

  return (
    <SideMenu ContentView={ContentView} className="bg-cover bg-brand-purple">
      <Paper className="!max-w-md flex flex-col items-center text-center gap-4 p-4">
        <div className="w-16 h-16 rounded-full bg-amber-base/10 flex items-center justify-center border-2 border-amber-base">
          <Crown size={32} className="text-amber-base" />
        </div>
        {renderContent()}
      </Paper>
    </SideMenu>
  )
}

export default Subscription
