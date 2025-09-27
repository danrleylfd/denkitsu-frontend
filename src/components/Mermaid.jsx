import { useEffect, useRef } from "react"
import mermaid from "mermaid"
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

import { useTheme } from "../contexts/ThemeContext"
import Button from "./Button"

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "loose",
  suppressErrors: true
})

const Controls = ({ zoomIn, zoomOut, resetTransform }) => {
  return (
    <div className="absolute top-2 right-2 z-10 flex gap-1 bg-lightBg-secondary dark:bg-darkBg-secondary p-1 rounded-full shadow-md">
      <Button variant="secondary" size="icon" $rounded title="Aumentar Zoom (+)" onClick={() => zoomIn()}><ZoomIn size={16} /></Button>
      <Button variant="secondary" size="icon" $rounded title="Diminuir Zoom (-)" onClick={() => zoomOut()}><ZoomOut size={16} /></Button>
      <Button variant="secondary" size="icon" $rounded title="Resetar Zoom" onClick={() => resetTransform()}><RotateCcw size={16} /></Button>
    </div>
  )
}

const MermaidContent = ({ chart }) => {
  const containerRef = useRef(null)
  const { theme } = useTheme()
  const { zoomIn, zoomOut, resetTransform } = useControls()

  useEffect(() => {
    // 1. Reseta o zoom e pan imediatamente.
    resetTransform()

    // 2. Prossegue com a lógica de renderização.
    if (!chart || !containerRef.current) return

    mermaid.initialize({
      startOnLoad: false,
      theme: theme === "dark" ? "dark" : "neutral",
      securityLevel: "loose",
      suppressErrors: true
    })

    const container = containerRef.current
    let isMounted = true

    const renderChart = async () => {
      if (!isMounted || !container) return
      try {
        container.innerHTML = chart.replace(/\u00A0/g, ' ')
        container.removeAttribute("data-processed")

        await mermaid.run({
          nodes: [container]
        })

        if (isMounted) {
          const svgEl = container.querySelector("svg")
          if (svgEl) {
            svgEl.style.maxWidth = "100%"
            svgEl.style.height = "auto"
          }
        }
      } catch (error) {
        console.error("Mermaid run error:", error)
        if (isMounted) {
          container.innerHTML = `<pre style="white-space: pre-wrap; word-wrap: break-word; text-align: left;" class="text-red-base">Erro de renderização do diagrama:\n${error.message}</pre>`
        }
      }
    }

    const observer = new ResizeObserver(() => {
      if (container.clientWidth > 0) {
        observer.disconnect()
        renderChart()
      }
    })

    observer.observe(container)

    return () => {
      isMounted = false
      observer.disconnect()
    }
  }, [chart, theme, resetTransform])

  return (
    <>
      <Controls zoomIn={zoomIn} zoomOut={zoomOut} resetTransform={resetTransform} />
      <TransformComponent
        wrapperStyle={{ width: "100%", height: "100%" }}
        contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div ref={containerRef} className="mermaid-container w-full h-full" />
      </TransformComponent>
    </>
  )
}

const Mermaid = ({ chart }) => {
  return (
    <div className="relative w-full h-full max-h-96 overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.2}
        maxScale={3}
        limitToBounds={false}
        centerOnInit={true}
        doubleClick={{ disabled: true }}
        panning={{ velocityDisabled: true }}
      >
        <MermaidContent chart={chart} />
      </TransformWrapper>
    </div>
  )
}

export default Mermaid
