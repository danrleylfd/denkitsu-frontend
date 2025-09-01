import SideMenu from "../components/SideMenu"
import Paper from "../components/Paper"
import Markdown from "../components/Markdown"

const ContentView = ({ children }) => (
  <main
    className="flex flex-col items-center p-2 gap-2 mx-auto min-h-dvh w-full xs:max-w-[100%] sm:max-w-[90%] md:max-w-[75%] lg:max-w-[67%] ml-[3.5rem] md:ml-auto">
    {children}
  </main>
)

const Privacidade = () => {
  const privacyPolicyContent = `
### Extensão Denkitsu | Política de Privacidade

**Data de Vigência**: 20 de fevereiro de 2025

Denkitsu valoriza a privacidade dos seus usuários ("você" ou "seu"). Esta Política de Privacidade explica como Denkitsu coleta, usa e protege suas informações quando você usa a extensão Denkitsu para o Chrome (a "Extensão").

**Informações que Denkitsu Coleta**

Denkitsu coleta as seguintes informações:

**Informações da Página Atual**: A extensão extrai informações da página web que você está visualizando para exibir no side panel do Chrome. Essas informações podem incluir texto, imagens, links e outros dados presentes na página.

**Importante**: Essa extração é realizada apenas para fornecer uma resposta imediata e não é salva de forma alguma.

**Prompts do Usuário**: A extensão coleta os prompts que você insere para enviar para o Deepseek, Gemini ou Qwen. Esses prompts são usados para gerar respostas relevantes para suas solicitações.

**Como Denkitsu Usa Suas Informações**

Denkitsu usa as informações coletadas para:

**Fornecer Funcionalidades**: As informações da página atual são usadas para exibir informações relevantes no side panel, enquanto os prompts do usuário são usados para enviar para o Deepseek, Gemini ou Qwen e gerar respostas.

Compartilhamento de Informações

**Deepseek, Gemini e Qwen**: Os prompts do usuário são compartilhados com o Deepseek, Gemini ou Qwen para gerar respostas. Esses serviços podem ter suas próprias políticas de privacidade, que recomendamos que você consulte.

**Terceiros**: Denkitsu não compartilha suas informações com terceiros além do Deepseek, Gemini ou Qwen, conforme especificado nesta política. Em nenhuma hipótese seus dados pessoais serão vendidos ou alugados.

**Armazenamento e Segurança de Dados**

**Processamento Local**: As informações da página atual e os prompts do usuário são processados localmente no seu navegador. Denkitsu não transmite ou armazena seus dados em seus servidores.

**Segurança**: Denkitsu toma medidas razoáveis para proteger as informações processadas localmente contra acesso não autorizado, uso indevido ou alteração. No entanto, como o processamento é feito no seu dispositivo, a segurança dos seus dados também depende das suas práticas de segurança pessoal.

**Seus Direitos**

Como os dados são processados localmente, você tem controle sobre eles. Você pode limpar seu histórico de navegação e dados de extensão nas configurações do seu navegador Chrome.

**Alterações a esta Política de Privacidade**

Denkitsu pode atualizar esta Política de Privacidade periodicamente. Quaisquer alterações serão publicadas nesta página. Recomendamos que você revise esta Política de Privacidade regularmente para se manter informado sobre nossas práticas de privacidade.

**Contato**: [E-mail](mailto:danrley.reply+dev@gmail.com)
`

  return (
    <SideMenu fixed ContentView={ContentView} className="bg-cover bg-brand-purple">
      <Paper>
        <Markdown content={privacyPolicyContent} />
      </Paper>
    </SideMenu>
  )
}

export default Privacidade
