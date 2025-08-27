import { useState, useRef } from "react"
import {
  BookText, Eye, Sparkles, Save, CaseSensitive, Languages,
  Bold, Italic, Underline, Strikethrough, Heading, Link as LinkIcon, List, Image as ImageIcon
} from "lucide-react"

import { useModels } from "../contexts/ModelContext"

import { sendMessage } from "../services/aiChat"

import SideMenu from "../components/SideMenu"
import Markdown from "../components/Markdown"
import Button from "../components/Button"

const EditorContentView = ({ children }) => (
  <main className="flex flex-1 flex-col h-dvh">{children}</main>
)

const Editor = () => {
  const [text, setText] = useState(
    "# Bem-vindo ao Editor!\n\nUse a barra de ferramentas para formatar seu texto com **Markdown**.\n\n- Posicione o cursor em uma linha e clique no botão 'H' para alternar o cabeçalho."
  )
  const [activeTab, setActiveTab] = useState("editor")
  const [loadingAi, setLoadingAi] = useState(false)
  const { aiKey, aiProvider, model, freeModels, payModels, groqModels } = useModels()

  const textAreaRef = useRef(null)

  const applyMarkdown = (syntax) => {
    const editor = textAreaRef.current
    if (!editor) return

    const { selectionStart, selectionEnd } = editor
    const selectedText = text.substring(selectionStart, selectionEnd)

    const newText = `${syntax.start}${selectedText}${syntax.end}`
    setText(`${text.substring(0, selectionStart)}${newText}${text.substring(selectionEnd)}`)

    setTimeout(() => {
      editor.focus()
      const newPosition = selectionStart + syntax.start.length
      editor.setSelectionRange(newPosition, newPosition + selectedText.length)
    }, 0)
  }

  const handleHeadingToggle = () => {
    const editor = textAreaRef.current
    if (!editor) return

    const { selectionStart } = editor
    const textBeforeCursor = text.substring(0, selectionStart)
    const lineStartIndex = textBeforeCursor.lastIndexOf("\n") + 1

    let lineEndIndex = text.indexOf("\n", lineStartIndex)
    if (lineEndIndex === -1) {
      lineEndIndex = text.length
    }

    const currentLine = text.substring(lineStartIndex, lineEndIndex)
    const headingMatch = currentLine.match(/^(#+)\s/)

    let newLevel = 1
    let content = currentLine

    if (headingMatch) {
      const currentLevel = headingMatch[1].length
      newLevel = currentLevel >= 6 ? 0 : currentLevel + 1
      content = currentLine.replace(headingMatch[0], "")
    }

    const newHeading = newLevel > 0 ? `${"#".repeat(newLevel)} ${content}` : content

    const newText = `${text.substring(0, lineStartIndex)}${newHeading}${text.substring(lineEndIndex)}`
    setText(newText)

    setTimeout(() => {
      editor.focus()
      const diff = newHeading.length - currentLine.length
      editor.setSelectionRange(selectionStart + diff, selectionStart + diff)
    }, 0)
  }

  const handleLink = () => {
    const url = prompt("Digite a URL para o link:")
    if (url) {
      applyMarkdown({ start: "[", end: `](${url})` })
    }
  }

  const handleImage = () => {
    const url = prompt("Digite a URL da imagem:")
    if (url) {
      const altText = text.substring(textAreaRef.current.selectionStart, textAreaRef.current.selectionEnd) || "texto alternativo"
      applyMarkdown({ start: `![${altText}`, end: `](${url})` })
    }
  }

  const handleAiAction = async (actionType) => {
    if (loadingAi) return
    const selectedText = window.getSelection().toString() || text
    if (!selectedText.trim()) {
      alert("Por favor, escreva ou selecione um texto para a IA interagir.")
      return
    }
    setLoadingAi(true)
    let instruction = ""
    switch (actionType) {
      case "improve": instruction = "Melhore o seguinte texto..."; break
      case "correct": instruction = "Corrija a gramática e a ortografia do seguinte texto..."; break
      case "translate": instruction = "Traduza o seguinte texto para o Inglês..."; break
      default: setLoadingAi(false); return
    }
    const userPrompt = { role: "user", content: `${instruction}\n\n---\n\n${selectedText}` }
    try {
      const { data } = await sendMessage(aiKey, aiProvider, model, [...freeModels, ...payModels, ...groqModels], [userPrompt], "Redator")
      const resultText = data?.choices?.[0]?.message?.content
      if (resultText) {
        setText(currentText => currentText.replace(selectedText, resultText.trim()))
      } else {
        throw new Error("A resposta da IA veio vazia.")
      }
    } catch (error) {
      console.error("Falha na ação de IA:", error)
      alert(`Ocorreu um erro ao processar a solicitação: ${error.message}`)
    } finally {
      setLoadingAi(false)
    }
  }

  const handleSave = async () => {
    if (!text.trim()) {
      alert("Não há conteúdo para salvar.")
      return
    }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    if ("showSaveFilePicker" in window) {
      try {
        const options = {
          suggestedName: `denkitsu-editor-${Date.now()}.md`,
          types: [
            {
              description: "Arquivo Markdown",
              accept: { "text/markdown": [".md"] },
            },
            {
              description: "Arquivo de Texto",
              accept: { "text/plain": [".txt"] },
            },
          ],
        }
        const handle = await window.showSaveFilePicker(options)
        const writable = await handle.createWritable()
        await writable.write(blob)
        await writable.close()
        return
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Erro ao salvar o arquivo:", error)
        }
        return
      }
    }
    try {
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `denkitsu-editor-${Date.now()}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro no método de fallback para salvar:", error)
      alert("Ocorreu um erro ao tentar salvar o arquivo.")
    }
  }

  return (
    <SideMenu ContentView={EditorContentView} className="bg-cover bg-center">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-1 p-2 bg-lightBg-tertiary dark:bg-darkBg-tertiary border-b border-bLight dark:border-bDark flex-wrap">
          <Button variant={activeTab === "editor" ? "primary" : "secondary"} size="sm" $squared onClick={() => setActiveTab("editor")}>
            <BookText size={16} className="mr-2" /> Editor
          </Button>
          <Button variant={activeTab === "preview" ? "primary" : "secondary"} size="sm" $squared onClick={() => setActiveTab("preview")}>
            <Eye size={16} className="mr-2" /> Preview
          </Button>

          <div className="h-6 w-px bg-bLight dark:bg-bDark mx-2"></div>

          <Button variant="secondary" size="icon" $squared title="Negrito" onClick={() => applyMarkdown({ start: "**", end: "**" })}><Bold size={16} /></Button>
          <Button variant="secondary" size="icon" $squared title="Itálico" onClick={() => applyMarkdown({ start: "*", end: "*" })}><Italic size={16} /></Button>
          <Button variant="secondary" size="icon" $squared title="Sublinhado" onClick={() => applyMarkdown({ start: "<u>", end: "</u>" })}><Underline size={16} /></Button>
          <Button variant="secondary" size="icon" $squared title="Riscado" onClick={() => applyMarkdown({ start: "~~", end: "~~" })}><Strikethrough size={16} /></Button>
          <Button variant="secondary" size="icon" $squared title="Alternar Cabeçalho (H1-H6)" onClick={handleHeadingToggle}><Heading size={16} /></Button>
          <Button variant="secondary" size="icon" $squared title="Lista" onClick={() => applyMarkdown({ start: "\n- ", end: "" })}><List size={16} /></Button>
          <Button variant="secondary" size="icon" $squared title="Link" onClick={handleLink}><LinkIcon size={16} /></Button>
          <Button variant="secondary" size="icon" $squared title="Imagem" onClick={handleImage}><ImageIcon size={16} /></Button>

          <div className="flex-grow" />

          <Button variant="outline" size="sm" $rounded onClick={() => handleAiAction("correct")} loading={loadingAi}><CaseSensitive size={16} className="mr-2" /> Corrigir</Button>
          <Button variant="outline" size="sm" $rounded onClick={() => handleAiAction("improve")} loading={loadingAi}><Sparkles size={16} className="mr-2" /> Melhorar</Button>
          <Button variant="outline" size="sm" $rounded onClick={() => handleAiAction("translate")} loading={loadingAi}><Languages size={16} className="mr-2" /> Traduzir</Button>
          <Button variant="success" size="sm" $rounded onClick={handleSave}><Save size={16} className="mr-2" /> Salvar</Button>
        </div>

        <div className="flex-1 p-4 h-full overflow-hidden bg-lightBg-primary dark:bg-darkBg-primary">
          {activeTab === "editor" ? (
            <textarea
              ref={textAreaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-full p-4 resize-none bg-lightBg-secondary dark:bg-darkBg-secondary text-lightFg-primary dark:text-darkFg-primary rounded-md focus:outline-none font-mono"
              spellCheck="false"
              placeholder="Comece a escrever aqui..."
            />
          ) : (
            <div className="w-full h-full p-4 bg-lightBg-secondary dark:bg-darkBg-secondary rounded-md overflow-y-auto">
              <Markdown content={text} />
            </div>
          )}
        </div>
      </div>
    </SideMenu>
  )
}

export default Editor
