"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import * as d3 from "d3"
import { ZoomIn, ZoomOut, RotateCcw, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { MarkmapViewer } from "@/components/markmap-viewer"

interface MindMapNode {
  id: string
  name: string
  children?: MindMapNode[]
}

interface MindMapProps {
  data: MindMapNode
  diagramType: string
  colorPalette: string
  layoutStyle: string
}

export function MindMap({ data, diagramType, colorPalette, layoutStyle }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<SVGGElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [diagramSize, setDiagramSize] = useState({ width: 0, height: 0 })
  const [colors, setColors] = useState<string[]>([])
  const [nodeShape, setNodeShape] = useState<string>("circle")

  // Usar refs para evitar re-renderizações desnecessárias
  const dataIdRef = useRef("")
  const initialPositionAppliedRef = useRef(false)

  // Função para obter cores com base na paleta selecionada
  const getColorsByPalette = useCallback((palette: string) => {
    switch (palette) {
      case "blue":
        return ["#1e40af", "#3b82f6", "#93c5fd", "#dbeafe"]
      case "green":
        return ["#166534", "#22c55e", "#86efac", "#dcfce7"]
      case "red":
        return ["#991b1b", "#ef4444", "#fca5a5", "#fee2e2"]
      case "purple":
        return ["#6b21a8", "#a855f7", "#d8b4fe", "#f3e8ff"]
      case "orange":
        return ["#9a3412", "#f97316", "#fdba74", "#ffedd5"]
      case "rainbow":
        return ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"]
      case "pastel":
        return ["#f87171", "#fdba74", "#fde047", "#86efac", "#93c5fd", "#d8b4fe"]
      case "earth":
        return ["#78350f", "#a16207", "#15803d", "#166534", "#1e3a8a"]
      default:
        return ["#4f46e5", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"]
    }
  }, [])

  // Função para obter forma do nó com base no estilo de layout
  const getNodeShape = useCallback((style: string) => {
    switch (style) {
      case "rect":
        return "rect"
      case "diamond":
        return "diamond"
      default:
        return "circle"
    }
  }, [])

  // Função para calcular as dimensões reais do diagrama
  const calculateDiagramSize = useCallback(() => {
    if (!svgRef.current) return { width: 0, height: 0 }

    try {
      // Obter todos os nós e links do diagrama
      const nodes = d3.select(svgRef.current).selectAll(".node").nodes()
      const links = d3.select(svgRef.current).selectAll(".link").nodes()

      if (nodes.length === 0) return { width: 0, height: 0 }

      // Inicializar com valores extremos
      let minX = Number.POSITIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY

      // Verificar cada nó
      nodes.forEach((node) => {
        const bbox = (node as SVGGElement).getBBox()
        const transform = (node as SVGGElement).getAttribute("transform")
        let x = 0
        let y = 0

        // Extrair valores de transformação
        if (transform) {
          const match = transform.match(/translate$$([^,]+),([^)]+)$$/)
          if (match) {
            x = Number.parseFloat(match[1])
            y = Number.parseFloat(match[2])
          }
        }

        // Atualizar limites
        minX = Math.min(minX, x + bbox.x)
        minY = Math.min(minY, y + bbox.y)
        maxX = Math.max(maxX, x + bbox.x + bbox.width)
        maxY = Math.max(maxY, y + bbox.y + bbox.height)
      })

      // Verificar cada link
      links.forEach((link) => {
        const bbox = (link as SVGPathElement).getBBox()

        // Atualizar limites
        minX = Math.min(minX, bbox.x)
        minY = Math.min(minY, bbox.y)
        maxX = Math.max(maxX, bbox.x + bbox.width)
        maxY = Math.max(maxY, bbox.y + bbox.height)
      })

      // Calcular dimensões
      const width = maxX - minX
      const height = maxY - minY

      return {
        width: width || 0,
        height: height || 0,
        minX: minX === Number.POSITIVE_INFINITY ? 0 : minX,
        minY: minY === Number.POSITIVE_INFINITY ? 0 : minY,
        maxX: maxX === Number.NEGATIVE_INFINITY ? 0 : maxX,
        maxY: maxY === Number.NEGATIVE_INFINITY ? 0 : maxY,
      }
    } catch (e) {
      console.error("Erro ao calcular dimensões do diagrama:", e)
      return { width: 0, height: 0 }
    }
  }, [])

  // Função para centralizar o diagrama
  const centerDiagram = useCallback(() => {
    if (!containerRef.current || !svgRef.current) return

    // Obter dimensões do contêiner
    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight

    console.log("Dimensões do contêiner:", { width: containerWidth, height: containerHeight })

    // Calcular dimensões do diagrama
    const diagramDimensions = calculateDiagramSize()
    console.log("Dimensões do diagrama:", diagramDimensions)

    if (diagramDimensions.width === 0 || diagramDimensions.height === 0) {
      // Se não conseguimos calcular as dimensões, usar valores padrão
      const centerX = containerWidth / 2
      const centerY = containerHeight / 2

      console.log("Usando posição central padrão:", { x: centerX, y: centerY })

      setPan({
        x: centerX,
        y: centerY,
      })
      setZoom(1)
      return
    }

    // Calcular o centro do diagrama
    const diagramCenterX = (diagramDimensions.minX + diagramDimensions.maxX) / 2
    const diagramCenterY = (diagramDimensions.minY + diagramDimensions.maxY) / 2

    // Calcular o zoom ideal para exibir todo o diagrama
    const padding = 60 // Aumentar o padding para garantir mais espaço
    const widthRatio = (containerWidth - padding * 2) / diagramDimensions.width
    const heightRatio = (containerHeight - padding * 2) / diagramDimensions.height
    const idealZoom = Math.min(widthRatio, heightRatio, 1) // Limitar zoom a 1 (sem ampliar)

    // Calcular a posição para centralizar
    const centerX = containerWidth / 2 - diagramCenterX * idealZoom
    const centerY = containerHeight / 2 - diagramCenterY * idealZoom

    console.log("Nova posição calculada:", { x: centerX, y: centerY, zoom: idealZoom * 0.9 })

    // Aplicar o posicionamento e zoom calculados
    setPan({
      x: centerX,
      y: centerY,
    })
    setZoom(idealZoom * 0.9) // Usar 90% do zoom ideal para garantir que tudo seja visível

    // Atualizar o estado de dimensões do diagrama
    setDiagramSize({
      width: diagramDimensions.width,
      height: diagramDimensions.height,
    })

    // Marcar que o posicionamento inicial foi aplicado
    initialPositionAppliedRef.current = true
  }, [calculateDiagramSize])

  // Função para renderizar o diagrama
  const renderDiagram = useCallback(() => {
    if (!data || !svgRef.current) return false

    // Verificar se os dados mudaram
    const currentDataId = data.id || JSON.stringify(data).substring(0, 50)
    const isNewData = currentDataId !== dataIdRef.current

    if (isNewData) {
      dataIdRef.current = currentDataId
      initialPositionAppliedRef.current = false
    }

    // Limpar SVG existente
    d3.select(svgRef.current).selectAll("*").remove()

    // Dimensões base do SVG
    const width = 800
    const height = 500

    // Criar hierarquia
    const root = d3.hierarchy(data)

    // Definir layout com base no tipo de diagrama
    let layout: any
    let isRadial = false

    // Configurar margens adequadas para cada tipo de diagrama
    const margin = { top: 50, right: 150, bottom: 50, left: 150 }

    switch (diagramType) {
      case "logical-structure":
        layout = d3.tree().size([height - margin.top - margin.bottom, width - margin.right - margin.left])
        break
      case "logical-structure-left":
        layout = d3.tree().size([height - margin.top - margin.bottom, width - margin.right - margin.left])
        break
      case "mind-map":
        // Para mapa mental, usamos um layout radial
        isRadial = true
        layout = d3
          .tree()
          .size([2 * Math.PI, Math.min(width, height) / 3]) // Layout circular
          .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)
        break
      case "fishbone":
        layout = d3.tree().size([height - margin.top - margin.bottom, width - margin.right - margin.left])
        break
      default:
        layout = d3.tree().size([height - margin.top - margin.bottom, width - margin.right - margin.left])
    }

    // Aplicar layout
    layout(root)

    // Criar grupo principal do SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("class", "diagram-container")

    // Salvar referência ao grupo do diagrama
    diagramRef.current = svg.node() as SVGGElement

    // Ajustar a transformação com base no tipo de diagrama
    if (isRadial) {
      // Para layouts radiais (mapa mental), centralizamos no meio
      svg.attr("transform", `translate(${width / 2},${height / 2})`)
    } else if (diagramType === "logical-structure-left") {
      // Para estrutura lógica à esquerda, invertemos a direção
      svg.attr("transform", `translate(${width - margin.right},${margin.top})`)
    } else {
      // Para outros tipos
      svg.attr("transform", `translate(${margin.left},${margin.top})`)
    }

    // Função para gerar links com base no tipo de diagrama
    const generateLink = (d: any) => {
      if (isRadial) {
        // Para mapa mental (layout radial)
        return d3
          .linkRadial()
          .angle((d: any) => d.x)
          .radius((d: any) => d.y)(d)
      }

      switch (diagramType) {
        case "logical-structure":
          return d3
            .linkHorizontal()
            .x((d: any) => d.y)
            .y((d: any) => d.x)(d)
        case "logical-structure-left":
          return d3
            .linkHorizontal()
            .x((d: any) => -d.y)
            .y((d: any) => d.x)(d)
        case "fishbone":
          // Diagrama espinha de peixe (fishbone)
          const source = { x: d.source.x, y: d.source.y }
          const target = { x: d.target.x, y: d.target.y }
          return `M${source.y},${source.x} 
                  H${source.y + (target.y - source.y) / 2} 
                  V${target.x} 
                  H${target.y}`
        default:
          return d3
            .linkHorizontal()
            .x((d: any) => d.y)
            .y((d: any) => d.x)(d)
      }
    }

    // Adicionar links
    svg
      .selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", generateLink)
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5)

    // Adicionar nós
    const nodes = svg
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => {
        if (isRadial) {
          // Para mapa mental (layout radial)
          return `translate(${d.y * Math.sin(d.x)},${-d.y * Math.cos(d.x)})`
        } else if (diagramType === "logical-structure-left") {
          return `translate(${-d.y},${d.x})`
        } else {
          return `translate(${d.y},${d.x})`
        }
      })

    // Aplicar estilo de layout
    const nodeShapeType = getNodeShape(layoutStyle)

    // Adicionar formas para os nós com base no estilo de layout
    if (nodeShapeType === "circle") {
      nodes
        .append("circle")
        .attr("r", 5)
        .attr("fill", (d: any) => colors[d.depth % colors.length])
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
    } else if (nodeShapeType === "rect") {
      nodes
        .append("rect")
        .attr("x", -30)
        .attr("y", -15)
        .attr("width", 60)
        .attr("height", 30)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("fill", (d: any) => colors[d.depth % colors.length])
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
    } else if (nodeShapeType === "diamond") {
      nodes
        .append("polygon")
        .attr("points", "0,-10 10,0 0,10 -10,0")
        .attr("fill", (d: any) => colors[d.depth % colors.length])
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
    }

    // Textos para os nós
    nodes
      .append("text")
      .attr("dy", ".31em")
      .attr("x", (d: any) => {
        if (diagramType === "logical-structure-left") {
          return d.children ? 8 : -8
        } else if (nodeShapeType === "rect") {
          return 0
        } else {
          return d.children ? -8 : 8
        }
      })
      .attr("text-anchor", (d: any) => {
        if (diagramType === "logical-structure-left") {
          return d.children ? "start" : "end"
        } else if (nodeShapeType === "rect") {
          return "middle"
        } else {
          return d.children ? "end" : "start"
        }
      })
      .attr("y", nodeShapeType === "rect" ? 0 : undefined)
      .attr("dominant-baseline", nodeShapeType === "rect" ? "middle" : undefined)
      .text((d: any) => d.data.name)
      .attr("font-size", "12px")
      .attr("fill", nodeShapeType === "rect" ? "#fff" : "#333")

    return isNewData
  }, [colors, data, diagramType, getNodeShape, layoutStyle])

  // Função para exportar o diagrama como Markdown
  function exportAsMarkdown() {
    if (!data) return

    // Função recursiva para gerar Markdown a partir da estrutura de dados
    const generateMarkdown = (node: MindMapNode, level = 1) => {
      // Usar # para títulos com base no nível
      const heading = "#".repeat(Math.min(level, 6)) + " "
      let markdown = heading + node.name + "\n\n"

      // Processar filhos recursivamente
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          markdown += generateMarkdown(child, level + 1)
        })
      }

      return markdown
    }

    // Gerar o conteúdo Markdown
    const markdownContent = generateMarkdown(data)

    // Criar um blob e fazer download
    const blob = new Blob([markdownContent], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "mind-map.md"
    link.click()
    URL.revokeObjectURL(url)
  }

  // Efeito para renderizar o diagrama quando os dados ou configurações mudam
  useEffect(() => {
    const isNewData = renderDiagram()

    // Se são novos dados, resetar o posicionamento
    if (isNewData) {
      // Resetar o pan e zoom para valores iniciais
      setPan({ x: 0, y: 0 })
      setZoom(1)

      // Usar setTimeout para garantir que o DOM foi atualizado
      // e que todos os elementos do diagrama foram renderizados
      setTimeout(() => {
        centerDiagram()
      }, 200) // Aumentar o timeout para garantir que o diagrama foi completamente renderizado
    }
  }, [centerDiagram, colors, data, diagramType, layoutStyle, renderDiagram])

  // Efeito para aplicar pan e zoom
  useEffect(() => {
    if (!svgRef.current) return

    const container = d3.select(svgRef.current).select(".diagram-container")
    if (!container.empty()) {
      container.attr("transform", `translate(${pan.x}, ${pan.y}) scale(${zoom})`)
    }
  }, [pan, zoom])

  // Funções de controle de zoom e pan
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0])
  }

  const handleReset = () => {
    centerDiagram()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Apenas botão esquerdo do mouse
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })

      // Mudar cursor para indicar arrasto
      if (containerRef.current) {
        containerRef.current.style.cursor = "grabbing"
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

      setPan((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }))

      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    // Restaurar cursor
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab"
    }
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)

      // Restaurar cursor
      if (containerRef.current) {
        containerRef.current.style.cursor = "grab"
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    // Ajustar o zoom com a roda do mouse
    if (e.deltaY < 0) {
      // Scroll para cima - zoom in
      setZoom((prev) => Math.min(prev + 0.05, 2))
    } else {
      // Scroll para baixo - zoom out
      setZoom((prev) => Math.max(prev - 0.05, 0.5))
    }
  }

  // Função para exportar o diagrama como PNG
  const exportAsPNG = () => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const img = new Image()
    img.onload = () => {
      canvas.width = 800
      canvas.height = 500

      // Desenhar o fundo pontilhado
      if (ctx) {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Desenhar os pontos
        ctx.fillStyle = "#e5e7eb"
        for (let x = 0; x < canvas.width; x += 20) {
          for (let y = 0; y < canvas.height; y += 20) {
            ctx.beginPath()
            ctx.arc(x, y, 1, 0, 2 * Math.PI)
            ctx.fill()
          }
        }

        // Desenhar o SVG
        ctx.drawImage(img, 0, 0)

        // Converter para PNG e fazer download
        const link = document.createElement("a")
        link.download = "mind-map.png"
        link.href = canvas.toDataURL("image/png")
        link.click()
      }
    }

    img.crossOrigin = "anonymous"
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData)
  }

  // Efeito para recentralizar o diagrama quando o tamanho da janela mudar
  useEffect(() => {
    const handleResize = () => {
      centerDiagram()
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [centerDiagram])

  useEffect(() => {
    setColors(getColorsByPalette(colorPalette))
  }, [colorPalette, getColorsByPalette])

  useEffect(() => {
    setNodeShape(getNodeShape(layoutStyle))
  }, [getNodeShape, layoutStyle])

  // Renderizar Markmap se o tipo de diagrama for "markdown"
  if (diagramType === "markdown") {
    return <MarkmapViewer data={data} height={500} />
  }

  return (
    <div className="flex flex-col gap-4" data-testid="mind-map-component">
      <div
        ref={containerRef}
        className="w-full h-[500px] border rounded-lg relative bg-white"
        style={{
          backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          cursor: isDragging ? "grabbing" : "grab",
          overflow: "hidden", // Contém o SVG dentro do contêiner
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        data-testid="diagram-container"
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
          data-testid="diagram-svg"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            title="Diminuir zoom"
            data-testid="zoom-out-button"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <div className="w-[200px]">
            <Slider
              defaultValue={[1]}
              value={[zoom]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={handleZoomChange}
              data-testid="zoom-slider"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            title="Aumentar zoom"
            data-testid="zoom-in-button"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            title="Resetar visualização"
            data-testid="reset-button"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportAsPNG} data-testid="export-button">
            <Download className="h-4 w-4 mr-2" />
            Exportar PNG
          </Button>
          <Button variant="outline" onClick={exportAsMarkdown} data-testid="export-markdown-button">
            <FileText className="h-4 w-4 mr-2" />
            Exportar Markdown
          </Button>
        </div>
      </div>
    </div>
  )
}
