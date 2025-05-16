"use client"

import { useEffect, useRef, useState } from "react"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MindMapNode {
  id: string
  name: string
  children?: MindMapNode[]
}

interface MarkdownMindMapProps {
  data: MindMapNode
  colorPalette: string
  fullscreen?: boolean
}

export function MarkdownMindMap({ data, colorPalette, fullscreen = false }: MarkdownMindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Inicializar com o nó raiz expandido
  useEffect(() => {
    if (data) {
      setExpandedNodes(new Set([data.id]))
    }
  }, [data])

  // Obter cores com base na paleta selecionada
  const getColors = (palette: string) => {
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

  const colors = getColors(colorPalette)

  // Função para alternar a expansão de um nó
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  // Função recursiva para renderizar nós
  const renderNode = (node: MindMapNode, depth = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const color = colors[depth % colors.length]
    const headingLevel = Math.min(depth + 1, 6)
    const headingSymbol = "#".repeat(headingLevel)

    return (
      <div key={node.id} className="mb-2" style={{ marginLeft: `${depth * 20}px` }}>
        <div className="flex items-center">
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className="mr-2 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? "−" : "+"}
            </button>
          )}
          {!hasChildren && <div className="w-5 mr-2"></div>}
          <div className="flex items-center">
            <span className="font-mono mr-2 font-bold" style={{ color }}>
              {headingSymbol}
            </span>
            <span className="font-medium">{node.name}</span>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="mt-2 border-l-2 pl-2" style={{ borderColor: color }}>
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  // Função para exportar o diagrama como Markdown
  const exportAsMarkdown = () => {
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

  return (
    <div className={`flex flex-col gap-4 ${fullscreen ? "h-screen" : ""}`} data-testid="markdown-mind-map">
      <div
        ref={containerRef}
        className={`${fullscreen ? "w-full h-full" : "w-full h-[500px]"} border rounded-lg relative bg-white p-6 overflow-auto`}
        style={{
          backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {data && renderNode(data)}
      </div>

      {/* Botões de exportação flutuantes quando em modo tela cheia */}
      {fullscreen && (
        <div className="absolute top-4 right-4 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
          <Button variant="outline" onClick={exportAsMarkdown} data-testid="export-markdown-button" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Exportar Markdown
          </Button>
        </div>
      )}

      {/* Controles fixos quando não estiver em modo tela cheia */}
      {!fullscreen && (
        <div className="flex items-center justify-end">
          <Button variant="outline" onClick={exportAsMarkdown} data-testid="export-markdown-button">
            <FileText className="h-4 w-4 mr-2" />
            Exportar Markdown
          </Button>
        </div>
      )}
    </div>
  )
}
