"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

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
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [pan, setPan] = useState({ x: 0, y: 0 })

  // Função para renderizar o diagrama
  const renderDiagram = () => {
    if (!data || !svgRef.current) return

    // Limpar SVG existente
    d3.select(svgRef.current).selectAll("*").remove()

    // Dimensões base do SVG
    const width = 800
    const height = 500

    // Criar hierarquia
    const root = d3.hierarchy(data)

    // Obter cores com base na paleta selecionada
    const colors = getColorsByPalette(colorPalette)

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
      case "org-chart":
        layout = d3.tree().size([width - margin.right - margin.left, height - margin.top - margin.bottom])
        break
      case "catalog":
        layout = d3.cluster().size([height - margin.top - margin.bottom, width - margin.right - margin.left])
        break
      case "timeline":
        layout = d3.tree().size([height - margin.top - margin.bottom, width - margin.right - margin.left])
        break
      case "vertical-timeline":
        layout = d3.tree().size([width - margin.right - margin.left, height - margin.top - margin.bottom])
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
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("class", "diagram-container")

    // Ajustar a transformação com base no tipo de diagrama
    if (isRadial) {
      // Para layouts radiais (mapa mental), centralizamos no meio
      svg.attr("transform", `translate(${width / 2},${height / 2})`)
    } else if (diagramType === "logical-structure-left") {
      // Para estrutura lógica à esquerda, invertemos a direção
      svg.attr("transform", `translate(${width - margin.right},${margin.top})`)
    } else if (diagramType === "org-chart" || diagramType === "vertical-timeline") {
      // Para gráficos organizacionais e linhas do tempo verticais
      svg.attr("transform", `translate(${margin.left},${margin.top})`)
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
        case "org-chart":
          return d3
            .linkVertical()
            .x((d: any) => d.x)
            .y((d: any) => d.y)(d)
        case "catalog":
          return d3
            .linkHorizontal()
            .x((d: any) => d.y)
            .y((d: any) => d.x)(d)
        case "timeline":
          return d3
            .linkHorizontal()
            .x((d: any) => d.y)
            .y((d: any) => d.x)(d)
        case "vertical-timeline":
          return d3
            .linkVertical()
            .x((d: any) => d.x)
            .y((d: any) => d.y)(d)
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
        } else if (diagramType === "org-chart" || diagramType === "vertical-timeline") {
          return `translate(${d.x},${d.y})`
        } else {
          return `translate(${d.y},${d.x})`
        }
      })

    // Aplicar estilo de layout
    const nodeShape = getNodeShape(layoutStyle)

    // Adicionar formas para os nós com base no estilo de layout
    if (nodeShape === "circle") {
      nodes
        .append("circle")
        .attr("r", 5)
        .attr("fill", (d: any) => colors[d.depth % colors.length])
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
    } else if (nodeShape === "rect") {
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
    } else if (nodeShape === "diamond") {
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
        } else if (nodeShape === "rect") {
          return 0
        } else {
          return d.children ? -8 : 8
        }
      })
      .attr("text-anchor", (d: any) => {
        if (diagramType === "logical-structure-left") {
          return d.children ? "start" : "end"
        } else if (nodeShape === "rect") {
          return "middle"
        } else {
          return d.children ? "end" : "start"
        }
      })
      .attr("y", nodeShape === "rect" ? 0 : undefined)
      .attr("dominant-baseline", nodeShape === "rect" ? "middle" : undefined)
      .text((d: any) => d.data.name)
      .attr("font-size", "12px")
      .attr("fill", nodeShape === "rect" ? "#fff" : "#333")
  }

  // Efeito para renderizar o diagrama quando os dados ou configurações mudam
  useEffect(() => {
    renderDiagram()
    // Resetar pan e zoom quando o diagrama muda
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }, [data, diagramType, colorPalette, layoutStyle])

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
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Apenas botão esquerdo do mouse
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
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
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
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

    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData)
  }

  // Função para obter cores com base na paleta selecionada
  function getColorsByPalette(palette: string) {
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
  }

  // Função para obter forma do nó com base no estilo de layout
  function getNodeShape(style: string) {
    switch (style) {
      case "rect":
        return "rect"
      case "diamond":
        return "diamond"
      default:
        return "circle"
    }
  }

  return (
    <div className="flex flex-col gap-4">
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
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "visible", // Permite que o conteúdo do SVG ultrapasse este div
          }}
        >
          <svg
            ref={svgRef}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: "none",
              maxHeight: "none",
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut} title="Diminuir zoom">
            <ZoomOut className="h-4 w-4" />
          </Button>

          <div className="w-[200px]">
            <Slider value={[zoom]} min={0.5} max={2} step={0.1} onValueChange={handleZoomChange} />
          </div>

          <Button variant="outline" size="icon" onClick={handleZoomIn} title="Aumentar zoom">
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon" onClick={handleReset} title="Resetar visualização">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportAsPNG}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PNG
          </Button>
        </div>
      </div>
    </div>
  )
}
