import { useAI } from "../../contexts/AIContext";
import Paper from "../Paper";
import Button from "../Button";

const AIAgents = ({ selectedAgent, onSelectAgent, agentsDoor }) => {
  if (!agentsDoor) return null;

  const agentOptions = [
    { value: "Padrão", icon: <Bot size={16} /> },
    { value: "Analista", icon: <BarChart2 size={16} /> },
    { value: "Blogueiro", icon: <Rss size={16} /> },
    { value: "Desenvolvedor", icon: <Code size={16} /> },
    { value: "Lousa", icon: <Presentation size={16} /> },
    { value: "Moderador", icon: <Shield size={16} /> },
    { value: "Professor", icon: <GraduationCap size={16} /> },
    { value: "Prompter", icon: <Lightbulb size={16} /> },
    { value: "Redator", icon: <FileText size={16} /> },
    { value: "Secretário", icon: <ClipboardList size={16} /> },
  ];

  return (
    <Paper className={`bg-lightBg-primary dark:bg-darkBg-primary text-lightFg-primary dark:text-darkFg-primary
      opacity-80 dark:opacity-90
      mb-2 py-2 gap-2 rounded-lg shadow-lg
      absolute z-20 left-1/2 -translate-x-1/2 bottom-full max-w-[95%]
      grid grid-cols-5 sm:grid-cols-9
      md:flex md:static md:mx-auto md:left-auto md:translate-x-0 md:bottom-auto`}
    >
      {agentOptions.map((agent) => (
        <Button
          key={agent.value}
          variant={selectedAgent === agent.value ? "outline" : "secondary"}
          size="icon"
          $rounded
          title={agent.value}
          onClick={() => onSelectAgent(agent.value)}
        >
          {agent.icon}
        </Button>
      ))}
    </Paper>
  );
};

export default AIAgents;
