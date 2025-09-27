import { useEffect, useRef, useId } from "react"
import mermaid from "mermaid"
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

import Button from "./Button"

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  suppressErrors: true
})

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls()
  return (
    <div className="absolute top-2 right-2 z-10 flex gap-1 bg-lightBg-secondary dark:bg-darkBg-secondary p-1 rounded-full shadow-md">
      <Button variant="secondary" size="icon" $rounded title="Aumentar Zoom (+)" onClick={() => zoomIn()}><ZoomIn size={16} /></Button>
      <Button variant="secondary" size="icon" $rounded title="Diminuir Zoom (-)" onClick={() => zoomOut()}><ZoomOut size={16} /></Button>
      <Button variant="secondary" size="icon" $rounded title="Resetar Zoom" onClick={() => resetTransform()}><RotateCcw size={16} /></Button>
    </div>
  )
}

const Mermaid = ({ chart }) => {
  const containerRef = useRef(null)
  const uniqueId = useId()
  useEffect(() => {
    if (!chart || !containerRef.current) return
    let isMounted = true
    const renderChart = async () => {
      try {
        const { svg } = await mermaid.render(uniqueId, chart)
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg
          const svgEl = containerRef.current.querySelector("svg")
          if (svgEl) {
            svgEl.style.maxWidth = "100%"
            svgEl.style.height = "auto"
          }
        }
      } catch (error) {
        console.error("Mermaid render error:", error)
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = `<pre style="white-space: pre-wrap; word-wrap: break-word; text-align: left;" class="text-red-base p-2">Erro de sintaxe no diagrama:\n${error.message}</pre>`
        }
      }
    }
    renderChart()
    return () => {
      isMounted = false
    }
  }, [chart, uniqueId])

  return (
    <div className="relative w-full h-full max-h-96 border border-bLight dark:border-bDark rounded-md overflow-hidden bg-white dark:bg-white">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        limitToBounds={false}
        centerOnInit={true}
        doubleClick={{ disabled: true }}
        panning={{ velocityDisabled: true }}
      >
        <Controls />
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div ref={containerRef} className="mermaid-container w-full h-full p-2" />
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}

export default Mermaid
