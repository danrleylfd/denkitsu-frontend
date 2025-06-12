import ReactMarkdown from "react-markdown"

import SideMenu from "../components/SideMenu"
import Paper from "../components/Paper"

const outageNews = `**Apagão digital global afeta serviços essenciais e expõe fragilidade da infraestrutura da internet**
![Imagem indisponível](https://gazettengr.com/wp-content/uploads/Artboard-1-480.png)

Na manhã de 12 de junho de 2025, um colapso simultâneo nas principais plataformas de computação em nuvem — Cloudflare, Google Cloud e AWS — provocou um dos maiores apagões digitais da história recente. Milhões de usuários em todo o mundo enfrentaram a interrupção de serviços como Spotify, Discord, Twitch, Google, e até mesmo instituições financeiras. A falha escancarou a interdependência da internet moderna e levantou preocupações sobre resiliência digital global.

**Interrupção em cascata atinge serviços populares e bancos**

Por volta das 06h da manhã (horário de Brasília), usuários começaram a relatar falhas generalizadas em serviços amplamente utilizados. Discord, Twitch e Reddit ficaram indisponíveis, seguidos por instabilidades no Spotify, YouTube e diversos serviços da Google. No Brasil, clientes de bancos como Nubank, Bradesco e Banco do Brasil não conseguiram acessar aplicativos ou realizar transações. A extensão e simultaneidade do apagão deixaram claro que a falha ia além de uma instabilidade pontual.

**Cloudflare, Google Cloud e AWS enfrentam falha simultânea inédita**

Investigadores apontam que o apagão teve origem em falhas paralelas nas três maiores fornecedoras de infraestrutura de internet do mundo: Cloudflare, Amazon Web Services (AWS) e Google Cloud Platform. Essas empresas são responsáveis por sustentar grande parte da web global, oferecendo desde DNS até processamento de dados e hospedagem. A simultaneidade do colapso levanta a hipótese de uma falha sistêmica compartilhada — possivelmente relacionada a atualizações sincronizadas de rede, problemas com BGP ou ataques coordenados ainda não confirmados.

**Impactos expõem riscos de centralização e alertam para dependência crítica**

A queda de plataformas gigantescas evidencia a centralização excessiva da internet moderna. Poucas empresas controlam serviços fundamentais que operam em segundo plano, invisíveis para o usuário comum, mas cruciais para o funcionamento de milhares de sites, apps e sistemas bancários. O incidente reacende debates sobre diversificação da infraestrutura digital, uso de arquiteturas mais distribuídas e a criação de planos de contingência por parte de governos e empresas.

**Alerta global reforça urgência de redes mais resilientes**

Com a normalização gradual dos serviços ainda no final do dia 12, especialistas já começaram a discutir a necessidade de reformular o modelo atual de dependência da nuvem. A lição deixada pelo apagão de junho de 2025 é clara: a internet, apesar de parecer onipresente e inabalável, ainda é extremamente vulnerável. Fortalecer a segurança de infraestruturas críticas e promover soluções mais descentralizadas será essencial para prevenir colapsos semelhantes no futuro.

**Fonte(s):** [Satus Google Cloud](https://status.cloud.google.com/) | [Status Cloudflare](https://www.cloudflarestatus.com/)
`

const Outage = () => {
  return (
    <SideMenu fixed className="bg-no-repeat bg-contain bg-[url('/background.jpg')] bg-brand-purple">
      <Paper className="w-full opacity-75 dark:opacity-90">
        <ReactMarkdown
          components={{
            img: ({ node, ...props }) => <img className="w-full rounded" {...props} />,
            a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
            h1: ({ node, ...props }) => <strong {...props} />,
            h2: ({ node, ...props }) => <strong {...props} />,
            h3: ({ node, ...props }) => <strong {...props} />,
            h4: ({ node, ...props }) => <strong {...props} />,
            h5: ({ node, ...props }) => <strong {...props} />,
            h6: ({ node, ...props }) => <strong {...props} />,
            p: ({ node, ...props }) => <p {...props} />,
            pre: ({ node, ...props }) => <p {...props} />,
            code: ({ node, ...props }) => <p {...props} />
          }}>
          {outageNews}
        </ReactMarkdown>
        <small className="text-xs text-gray-500">Publicado em {new Date().toLocaleString()}</small>
      </Paper>
    </SideMenu>
  )
}

export default Outage
