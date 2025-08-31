// Frontend/src/components/AI/Codebase.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Folder, Search, Files, Download, Edit, Trash, Copy, X, FolderPlus, Loader2 } from "lucide-react";
import Button from "../Button";
import Input from "../Input";
import Paper from "../Paper";
import { useNotification } from "../../contexts/NotificationContext";
import { storage } from "../../utils/storage";
import { getHandle, setHandle, openDB } from "../../utils/directoryStorage";

const Codebase = () => {
  const [step, setStep] = useState("input");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [allFiles, setAllFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [result, setResult] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectSource, setProjectSource] = useState("local");
  const [recentProjects, setRecentProjects] = useState([]);
  const [viewingFile, setViewingFile] = useState(null);
  const isMounted = useRef(true);
  const { notifyError, notifyInfo } = useNotification();

  // Garantir que não atualizamos o estado se o componente foi desmontado
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Carregar projetos recentes ao montar o componente
  useEffect(() => {
    const loadRecentProjects = async () => {
      try {
        const savedRecents = await storage.local.getItem("codebase_recents");
        if (savedRecents && isMounted.current) {
          setRecentProjects(JSON.parse(savedRecents));
        }
      } catch (error) {
        console.error("Erro ao carregar projetos recentes:", error);
      }
    };

    loadRecentProjects();
  }, []);

  // Função para salvar projetos recentes
  const saveRecentProject = async (project) => {
    try {
      const updatedRecents = [project, ...recentProjects.filter(p => p.name !== project.name)]
        .slice(0, 3);

      setRecentProjects(updatedRecents);

      await storage.local.setItem("codebase_recents", JSON.stringify(updatedRecents));
    } catch (error) {
      console.error("Erro ao salvar projeto recente:", error);
    }
  };

  // Função para processar arquivos
  const handleFileProcessing = useCallback(async (files, projectName, source, isLocal = false) => {
    if (!isMounted.current) return;

    try {
      setIsProcessing(true);
      setStatusText("Processando arquivos...");

      const processedFiles = [];

      // Processamento assíncrono dos arquivos
      for (const file of files) {
        const content = await file.text();
        processedFiles.push({ path: file.webkitRelativePath || file.name, content });
      }

      setAllFiles(processedFiles);
      setProjectName(projectName);
      setProjectSource(source);

      if (isLocal) {
        // Salvar handle do diretório no IndexedDB
        await setHandle(projectName, files);
      }

      setStep("select");
    } catch (error) {
      if (isMounted.current && error.name !== "AbortError") {
        console.error("Erro ao processar arquivos:", error);
        notifyError("Não foi possível processar os arquivos.");
      }
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
      }
    }
  }, [notifyError]);

  // Função para selecionar diretório local
  const handleSelectDirectory = useCallback(async () => {
    if (!window.showDirectoryPicker) {
      notifyError("Seu navegador não suporta a seleção de diretórios.");
      return;
    }

    try {
      setIsProcessing(true);
      setStatusText("Selecionando diretório...");

      const dirHandle = await window.showDirectoryPicker();
      const files = [];

      const traverseHandles = async (handle, path = "") => {
        if (handle.kind === "file") {
          const file = await handle.getFile();
          file.webkitRelativePath = path + file.name;
          files.push(file);
        } else if (handle.kind === "directory") {
          for await (const entry of handle.values()) {
            await traverseHandles(entry, path + handle.name + "/");
          }
        }
      };

      await traverseHandles(dirHandle);

      if (files.length === 0) {
        notifyError("Nenhum arquivo encontrado no diretório selecionado.");
        return;
      }

      await handleFileProcessing(files, dirHandle.name, "local", true);
    } catch (error) {
      if (isMounted.current && error.name !== "AbortError") {
        console.error("Erro ao selecionar diretório:", error);
        notifyError("Não foi possível acessar o diretório.");
      }
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
      }
    }
  }, [handleFileProcessing, notifyError]);

  // Função para buscar repositório do GitHub
  const handleFetchGithubRepo = useCallback(async () => {
    if (!githubRepo.trim()) {
      notifyError("Por favor, insira uma URL válida do GitHub.");
      return;
    }

    try {
      setIsProcessing(true);
      setStatusText("Buscando repositório...");

      const response = await fetch("/api/github/fetchRepo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: githubRepo })
      });

      if (!response.ok) {
        throw new Error("Falha ao buscar repositório do GitHub");
      }

      const { projectName, files } = await response.json();
      setProjectName(projectName);
      setProjectSource("github");

      // Converter os dados para o formato esperado
      const processedFiles = files.map(file => ({
        path: file.path,
        content: file.content,
        webkitRelativePath: file.path
      }));

      setAllFiles(processedFiles);
      setStep("select");
    } catch (error) {
      console.error("Erro ao buscar repositório:", error);
      notifyError(error.message || "Falha ao buscar repositório do GitHub.");
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
      }
    }
  }, [githubRepo, notifyError]);

  // Função para gerar codebase
  const handleGenerateCodebase = useCallback(async () => {
    if (selectedFiles.size === 0) {
      notifyError("Nenhum arquivo selecionado.");
      return;
    }

    setIsProcessing(true);
    setStatusText("Gerando codebase...");

    try {
      // Função auxiliar para gerar a árvore de arquivos
      const generateFileTree = (filePaths, rootName) => {
        const tree = {};

        filePaths.forEach(path => {
          const parts = path.split('/');
          let currentLevel = tree;

          parts.forEach((part, i) => {
            if (!currentLevel[part]) {
              currentLevel[part] = i === parts.length - 1 ? null : {};
            }
            if (currentLevel[part] && typeof currentLevel[part] === 'object') {
              currentLevel = currentLevel[part];
            }
          });
        });

        const buildTreeString = (node, prefix = "", isLast = true) => {
          let result = "";
          const entries = Object.entries(node);

          entries.forEach(([entry, children], index) => {
            const isLastEntry = index === entries.length - 1;
            const newPrefix = prefix + (isLast ? "    " : "│   ");
            const line = isLast ? "└── " : "├── ";

            result += `${prefix}${line}${entry}\n`;

            if (children) {
              result += buildTreeString(children, newPrefix, isLastEntry);
            }
          });

          return result;
        };

        return `${rootName}/\n${buildTreeString(tree)}`;
      };

      const selectedFilesArray = allFiles.filter(file =>
        selectedFiles.has(file.path)
      );

      const fileTreeString = generateFileTree(
        selectedFilesArray.map(f => f.path),
        projectName
      );

      // Processar conteúdo dos arquivos
      const processContent = (content) =>
        content.replace(/(\r\n|\n|\r){3,}/g, "$1$1").trim();

      let codebaseString = "";
      const outputParts = [
        `PROJETO: ${projectName}`,
        "-",
        `ESTRUTURA DE FICHEIROS:\n${fileTreeString}-`,
        "CONTEÚDO DOS FICHEIROS:",
        "-",
        ...selectedFilesArray.map(({ path, content }) =>
          `-[ ${path} ]-\n${processContent(content)}`
        )
      ];

      codebaseString = outputParts.join("\n");
      setResult(codebaseString);

      // Salvar como projeto recente
      await saveRecentProject({
        name: projectName,
        source: projectSource,
        timestamp: new Date().toISOString()
      });

      setStep("result");
    } catch (error) {
      console.error("Erro ao gerar codebase:", error);
      notifyError(error.response?.data?.error || "Falha ao gerar o codebase.");
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
      }
    }
  }, [allFiles, selectedFiles, projectName, projectSource, saveRecentProject, notifyError]);

  // Função para resetar o componente
  const handleReset = useCallback(() => {
    setStep("input");
    setResult("");
    setGithubRepo("");
    setProjectName("");
    setAllFiles([]);
    setSelectedFiles(new Set());
    setStatusText("");
  }, []);

  // Função para copiar resultado
  const handleCopyResult = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(result)
        .then(() => notifyInfo("Copiado para a área de transferência!"))
        .catch(err => {
          console.error("Erro ao copiar:", err);
          notifyError("Falha ao copiar para a área de transferência.");
        });
    }
  }, [result, notifyInfo, notifyError]);

  // Função para baixar resultado
  const handleDownloadResult = useCallback(() => {
    if (!result) return;

    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/[\\/:"*?<>|]/g, "_")}_codebase.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, projectName]);

  // Função para visualizar arquivo
  const handleViewFile = useCallback((file) => {
    setViewingFile(file);
  }, []);

  // Função para fechar visualização de arquivo
  const handleCloseFileView = useCallback(() => {
    setViewingFile(null);
  }, []);

  // Renderização da tela de input
  const renderInputStep = () => (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-semibold text-lg mb-2">Origem do Projeto</h3>
        <div className="flex gap-2">
          <Button
            variant={projectSource === "local" ? "primary" : "outline"}
            onClick={() => {
              setProjectSource("local");
              setGithubRepo("");
            }}
          >
            <FolderPlus size={16} className="mr-2" />
            Diretório Local
          </Button>
          <Button
            variant={projectSource === "github" ? "primary" : "outline"}
            onClick={() => {
              setProjectSource("github");
              setAllFiles([]);
            }}
          >
            <Search size={16} className="mr-2" />
            GitHub
          </Button>
        </div>
      </div>

      {projectSource === "local" ? (
        <div className="space-y-4">
          <p className="text-lightFg-secondary dark:text-darkFg-secondary">
            Selecione um diretório local do seu computador para extrair o codebase.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSelectDirectory}
            disabled={isProcessing}
            className="w-full py-4"
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                {statusText}
              </>
            ) : (
              <>
                <Folder size={20} className="mr-2" />
                Selecionar Diretório
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-lightFg-secondary dark:text-darkFg-secondary">
            Insira a URL de um repositório público do GitHub para extrair o codebase.
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="https://github.com/usuario/repositorio"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={handleFetchGithubRepo}
              disabled={isProcessing || !githubRepo.trim()}
            >
              {isProcessing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
            </Button>
          </div>
        </div>
      )}

      {recentProjects.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Projetos Recentes</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentProjects.map((project, index) => (
              <Paper
                key={index}
                className="p-3 flex items-center justify-between hover:bg-lightBg-tertiary dark:hover:bg-darkBg-tertiary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Folder size={16} />
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-lightFg-tertiary dark:text-darkFg-tertiary">
                      {new Date(project.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // Aqui você implementaria a lógica para carregar um projeto recente
                    notifyInfo("Funcionalidade em desenvolvimento");
                  }}
                >
                  <Files size={16} />
                </Button>
              </Paper>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Renderização da tela de seleção de arquivos
  const renderSelectStep = () => (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">
          Selecione os arquivos para incluir no codebase
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedFiles(new Set(allFiles.map(f => f.path)))}
          >
            Selecionar Tudo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectedFiles(new Set())}
          >
            Limpar Seleção
          </Button>
        </div>
      </div>

      <p className="text-sm text-lightFg-secondary dark:text-darkFg-secondary text-center">
        {selectedFiles.size} de {allFiles.length} arquivos selecionados.
      </p>

      <div className="flex-1 overflow-y-auto p-2 bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded-md">
        <div className="space-y-1">
          {allFiles.map((file) => (
            <div
              key={file.path}
              className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                selectedFiles.has(file.path)
                  ? "bg-lightBg-primary dark:bg-darkBg-primary"
                  : "hover:bg-lightBg-tertiary dark:hover:bg-darkBg-tertiary"
              }`}
              onClick={() => {
                const newSelected = new Set(selectedFiles);
                if (newSelected.has(file.path)) {
                  newSelected.delete(file.path);
                } else {
                  newSelected.add(file.path);
                }
                setSelectedFiles(newSelected);
              }}
            >
              <input
                type="checkbox"
                checked={selectedFiles.has(file.path)}
                onChange={() => {}}
                className="mr-2"
              />
              <span className="text-sm">{file.path}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewFile(file);
                }}
              >
                <Search size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
        >
          <ArrowLeft size={16} className="mr-2" /> Voltar
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleGenerateCodebase}
          disabled={isProcessing || selectedFiles.size === 0}
        >
          {isProcessing ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              {statusText}
            </>
          ) : (
            <>
              <Files size={16} className="mr-2" /> Extrair Codebase
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Renderização da tela de resultado
  const renderResultStep = () => (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-xl">Codebase extraída de: {projectName}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleCopyResult}
          >
            <Copy size={16} className="mr-2" /> Copiar Tudo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadResult}
          >
            <Download size={16} className="mr-2" /> Baixar .txt
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-lightBg-tertiary dark:bg-darkBg-tertiary rounded p-4 font-mono text-sm whitespace-pre-wrap break-words">
        <pre className="m-0">{result}</pre>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setStep("select")}
        >
          <Edit size={16} className="mr-2" /> Voltar para Seleção
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
        >
          <Folder size={16} className="mr-2" /> Começar de Novo
        </Button>
      </div>
    </div>
  );

  // Renderização da visualização de arquivo
  const renderFileView = () => (
    viewingFile && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-lightBg-primary dark:bg-darkBg-primary rounded-lg w-3/4 max-w-4xl max-h-4/5 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-lightFg-tertiary dark:border-darkFg-tertiary">
            <h4 className="font-semibold">{viewingFile.path}</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseFileView}
            >
              <X size={16} />
            </Button>
          </div>
          <div className="p-4 overflow-auto max-h-[60vh] font-mono text-sm bg-lightBg-tertiary dark:bg-darkBg-tertiary">
            <pre className="whitespace-pre-wrap break-words m-0">{viewingFile.content}</pre>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        {step === "input" && renderInputStep()}
        {step === "select" && renderSelectStep()}
        {step === "result" && renderResultStep()}
      </div>

      {renderFileView()}
    </div>
  );
};

export default Codebase;
