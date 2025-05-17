"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import { Download, FileText, ZoomIn, ZoomOut } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface MindMapNode {
  id: string
  name: string
  children?: MindMapNode[]
}

interface HorizontalMindMapProps {
  data: MindMapNode
  colorPalette: string
  fullscreen?: boolean
}

export function HorizontalMindMap({ data, colorPalette, fullscreen = false }: HorizontalMindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [pan, setPan] = useState({ x: 0, y: 0 })

  // Função para obter cores com base na paleta selecionada
  const getColorsByPalette = useCallback((palette: string) => {
    switch (palette) {
      case "blue":
        return ["#4353a4", "#6a75d1", "#8a93e1", "#b1b7f1"]
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
        return ["#4353a4", "#6a75d1", "#8a93e1", "#b1b7f1"]
    }
  }, [])

  // Função para dividir os nós filhos em dois grupos (esquerda e direita)
  const splitChildren = (node: MindMapNode) => {
    if (!node.children || node.children.length === 0) {
      return { left: [], right: [] }
    }

    const totalChildren = node.children.length
    const midPoint = Math.ceil(totalChildren / 2)

    // Dividir os filhos em dois grupos
    const left = node.children.slice(0, midPoint)
    const right = node.children.slice(midPoint)

    return { left, right }
  }

  // Renderizar o mapa mental
  const renderMindMap = useCallback(() => {
    if (!svgRef.current || !data) return

    // Limpar SVG existente
    d3.select(svgRef.current).selectAll("*").remove()

    const colors = getColorsByPalette(colorPalette)
    const mainColor = colors[0]

    // Dimensões do SVG
    const width = 2000 // Aumentado para acomodar mais espaço
    const height = 1200 // Aumentado para acomodar mais espaço
    const nodeWidth = 180
    const nodeHeight = 40
    const horizontalSpacing = 300 // Aumentado para maior separação horizontal
    const verticalSpacing = 120 // Aumentado para maior separação vertical entre filhos
    const grandchildSpacing = 100 // Espaçamento específico para netos

    // Criar grupo principal do SVG com posição fixa
    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("class", "diagram-container")
      .attr("transform", `translate(${width / 2}, ${height / 2})`) // Manter posição fixa

    // Função para calcular posições dos nós
    const calculateNodePositions = () => {
      // Posição do nó raiz (centro)
      const rootNode = {
        ...data,
        x: 0,
        y: 0,
        level: 0,
      }

      // Dividir filhos em esquerda e direita
      const { left: leftChildren, right: rightChildren } = splitChildren(data)

      // Processar nós à esquerda
      const leftNodes = []
      if (leftChildren.length > 0) {
        // Calcular altura total necessária para os filhos à esquerda
        let totalLeftHeight = 0
        leftChildren.forEach((child) => {
          // Cada filho precisa de espaço para si mesmo e seus filhos
          const childrenCount = child.children ? child.children.length : 0
          // Usar o máximo entre 1 (para o próprio nó) e o número de filhos
          const spaceNeeded = Math.max(1, childrenCount) * verticalSpacing
          totalLeftHeight += spaceNeeded
        })

        // Posição inicial Y
        let currentY = -totalLeftHeight / 2

        leftChildren.forEach((child, index) => {
          // Calcular espaço necessário para este nó e seus filhos
          const childrenCount = child.children ? child.children.length : 0
          const spaceNeeded = Math.max(1, childrenCount) * verticalSpacing

          // Posicionar o nó filho no centro do seu espaço alocado
          const childNode = {
            ...child,
            x: -horizontalSpacing,
            y: currentY + spaceNeeded / 2,
            level: 1,
            side: "left",
          }
          leftNodes.push(childNode)

          // Processar netos (nível 2) à esquerda
          if (child.children && child.children.length > 0) {
            // Calcular altura total dos netos
            const grandchildrenHeight = child.children.length * grandchildSpacing
            // Posição inicial Y para os netos
            const grandchildStartY = childNode.y - grandchildrenHeight / 2 + grandchildSpacing / 2

            child.children.forEach((grandchild, gIndex) => {
              leftNodes.push({
                ...grandchild,
                x: -horizontalSpacing * 2,
                y: grandchildStartY + gIndex * grandchildSpacing,
                level: 2,
                side: "left",
                parentId: child.id,
              })
            })
          }

          // Atualizar a posição Y para o próximo nó
          currentY += spaceNeeded
        })
      }

      // Processar nós à direita
      const rightNodes = []
      if (rightChildren.length > 0) {
        // Calcular altura total necessária para os filhos à direita
        let totalRightHeight = 0
        rightChildren.forEach((child) => {
          const childrenCount = child.children ? child.children.length : 0
          const spaceNeeded = Math.max(1, childrenCount) * verticalSpacing
          totalRightHeight += spaceNeeded
        })

        // Posição inicial Y
        let currentY = -totalRightHeight / 2

        rightChildren.forEach((child, index) => {
          // Calcular espaço necessário para este nó e seus filhos
          const childrenCount = child.children ? child.children.length : 0
          const spaceNeeded = Math.max(1, childrenCount) * verticalSpacing

          // Posicionar o nó filho no centro do seu espaço alocado
          const childNode = {
            ...child,
            x: horizontalSpacing,
            y: currentY + spaceNeeded / 2,
            level: 1,
            side: "right",
          }
          rightNodes.push(childNode)

          // Processar netos (nível 2) à direita
          if (child.children && child.children.length > 0) {
            // Calcular altura total dos netos
            const grandchildrenHeight = child.children.length * grandchildSpacing
            // Posição inicial Y para os netos
            const grandchildStartY = childNode.y - grandchildrenHeight / 2 + grandchildSpacing / 2

            child.children.forEach((grandchild, gIndex) => {
              rightNodes.push({
                ...grandchild,
                x: horizontalSpacing * 2,
                y: grandchildStartY + gIndex * grandchildSpacing,
                level: 2,
                side: "right",
                parentId: child.id,
              })
            })
          }

          // Atualizar a posição Y para o próximo nó
          currentY += spaceNeeded
        })
      }

      return {
        root: rootNode,
        left: leftNodes,
        right: rightNodes,
      }
    }

    // Calcular posições
    const nodes = calculateNodePositions()

    // Desenhar nó raiz
    const rootGroup = svg.append("g").attr("class", "node root-node")

    rootGroup
      .append("rect")
      .attr("x", -nodeWidth / 2)
      .attr("y", -nodeHeight / 2)
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", mainColor)
      .attr("stroke", mainColor)
      .attr("stroke-width", 1)

    rootGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "#ffffff")
      .text(nodes.root.name)

    // Função para desenhar nós e conexões
    const drawNodes = (nodeList, parentNode) => {
      nodeList.forEach((node) => {
        // Desenhar nó
        const nodeGroup = svg.append("g").attr("class", "node")

        nodeGroup
          .append("rect")
          .attr("x", node.x - nodeWidth / 2)
          .attr("y", node.y - nodeHeight / 2)
          .attr("width", nodeWidth)
          .attr("height", nodeHeight)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("fill", "#f0f0f0")
          .attr("stroke", colors[node.level % colors.length])
          .attr("stroke-width", 1)

        nodeGroup
          .append("text")
          .attr("x", node.x)
          .attr("y", node.y)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#333333")
          .text(node.name)

        // Encontrar o nó pai correto
        let parent
        if (node.level === 1) {
          parent = parentNode
        } else if (node.level === 2) {
          // Para nós de nível 2, encontrar o pai correto pelo ID
          const parentList = node.side === "left" ? nodes.left : nodes.right
          parent = parentList.find((p) => p.id === node.parentId)
        }

        // Desenhar conexão com o pai
        if (parent) {
          // Calcular pontos para a curva
          const startX = parent.x + (node.side === "left" ? -nodeWidth / 2 : nodeWidth / 2)
          const startY = parent.y
          const endX = node.x + (node.side === "left" ? nodeWidth / 2 : -nodeWidth / 2)
          const endY = node.y

          // Pontos de controle para curva
          const controlX1 = startX + (endX - startX) * 0.5
          const controlY1 = startY
          const controlX2 = endX - (endX - startX) * 0.5
          const controlY2 = endY

          // Desenhar caminho curvo
          svg
            .append("path")
            .attr("d", `M${startX},${startY} C${controlX1},${controlY1} ${controlX2},${controlY2} ${endX},${endY}`)
            .attr("fill", "none")
            .attr("stroke", "#888")
            .attr("stroke-width", 1.5)
        }
      })
    }

    // Desenhar nós à esquerda e direita
    drawNodes(nodes.left, nodes.root)
    drawNodes(nodes.right, nodes.root)
  }, [data, colorPalette, getColorsByPalette])

  // Efeito para renderizar o mapa mental quando os dados ou configurações mudam
  useEffect(() => {
    renderMindMap()
  }, [renderMindMap])

  // Efeito para aplicar zoom e pan
  useEffect(() => {
    if (!svgRef.current) return

    const container = d3.select(svgRef.current).select(".diagram-container")
    if (!container.empty()) {
      const width = 2000
      const height = 1200
      container.attr("transform", `translate(${width / 2 + pan.x}, ${height / 2 + pan.y}) scale(${zoom})`)
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
    // Definir uma posição fixa em vez de centralizar automaticamente
    setPan({ x: 0, y: 0 })
    setZoom(0.8) // Zoom padrão
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })

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

    if (containerRef.current) {
      containerRef.current.style.cursor = "grab"
    }
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)

      if (containerRef.current) {
        containerRef.current.style.cursor = "grab"
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(prev + 0.05, 2))
    } else {
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
      canvas.width = 2000
      canvas.height = 1200

      if (ctx) {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = "#e5e7eb"
        for (let x = 0; x < canvas.width; x += 20) {
          for (let y = 0; y < canvas.height; y += 20) {
            ctx.beginPath()
            ctx.arc(x, y, 1, 0, 2 * Math.PI)
            ctx.fill()
          }
        }

        ctx.drawImage(img, 0, 0)

        const link = document.createElement("a")
        link.download = "horizontal-mind-map.png"
        link.href = canvas.toDataURL("image/png")
        link.click()
      }
    }

    img.crossOrigin = "anonymous"
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData)
  }

  // Função para exportar o diagrama como Markdown
  const exportAsMarkdown = () => {
    if (!data) return

    const generateMarkdown = (node: MindMapNode, level = 1) => {
      const heading = "#".repeat(Math.min(level, 6)) + " "
      let markdown = heading + node.name + "\n\n"

      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          markdown += generateMarkdown(child, level + 1)
        })
      }

      return markdown
    }

    const markdownContent = generateMarkdown(data)

    const blob = new Blob([markdownContent], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "horizontal-mind-map.md"
    link.click()
    URL.revokeObjectURL(url)
  }

  // Inicializar com zoom um pouco menor para ver mais do diagrama
  useEffect(() => {
    // Definir um zoom fixo em vez de um valor que ajusta automaticamente o diagrama
    setZoom(0.8)
  }, [])

  return (
    <div className={`flex flex-col gap-4 ${fullscreen ? "h-screen" : ""}`} data-testid="horizontal-mind-map-component">
      <div
        ref={containerRef}
        className={`${fullscreen ? "w-full h-full" : "w-full h-[500px]"} border rounded-lg relative bg-white`}
        style={{
          backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          cursor: isDragging ? "grabbing" : "grab",
          overflow: "hidden",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
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
        />

        {/* Controles flutuantes quando em modo tela cheia */}
        {fullscreen && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
            <Button variant="outline" size="icon" onClick={handleZoomOut} title="Diminuir zoom">
              <ZoomOut className="h-4 w-4" />
            </Button>

            <div className="w-[200px]">
              <Slider
                defaultValue={[0.8]}
                value={[zoom]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={handleZoomChange}
              />
            </div>

            <Button variant="outline" size="icon" onClick={handleZoomIn} title="Aumentar zoom">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Botões de exportação flutuantes quando em modo tela cheia */}
        {fullscreen && (
          <div className="absolute top-4 right-4 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
            <Button variant="outline" onClick={exportAsPNG} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PNG
            </Button>
            <Button variant="outline" onClick={exportAsMarkdown} size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Exportar Markdown
            </Button>
          </div>
        )}
      </div>

      {/* Controles fixos quando não estiver em modo tela cheia */}
      {!fullscreen && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut} title="Diminuir zoom">
              <ZoomOut className="h-4 w-4" />
            </Button>

            <div className="w-[200px]">
              <Slider
                defaultValue={[0.8]}
                value={[zoom]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={handleZoomChange}
              />
            </div>

            <Button variant="outline" size="icon" onClick={handleZoomIn} title="Aumentar zoom">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportAsPNG}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PNG
            </Button>
            <Button variant="outline" onClick={exportAsMarkdown}>
              <FileText className="h-4 w-4 mr-2" />
              Exportar Markdown
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
