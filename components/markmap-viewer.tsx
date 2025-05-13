"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

interface MarkmapViewerProps {
  data: any
  width?: string | number
  height?: string | number
}

// Versão simplificada do MarkmapViewer que não usa as bibliotecas externas
export function MarkmapViewer({ data, width = "100%", height = 500 }: MarkmapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Função para renderizar a estrutura do mapa mental de forma simples
  const renderMarkdownStructure = (node: any, level = 0) => {
    if (!node) return null

    const headingLevel = Math.min(level + 1, 6)
    const headingSymbol = "#".repeat(headingLevel)

    return (
      <div key={node.id} style={{ marginLeft: level * 20 + "px", marginBottom: "10px" }}>
        <div className="flex items-center">
          <span className="font-mono mr-2 font-bold" style={{ color: getColorForLevel(level) }}>
            {headingSymbol}
          </span>
          <span className="font-medium">{node.name}</span>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="mt-2">{node.children.map((child: any) => renderMarkdownStructure(child, level + 1))}</div>
        )}
      </div>
    )
  }

  // Função para obter cor com base no nível
  const getColorForLevel = (level: number) => {
    const colors = ["#4f46e5", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"]
    return colors[level % colors.length]
  }

  // Função para exportar o diagrama como Markdown
  const exportAsMarkdown = () => {
    if (!data) return

    // Função recursiva para gerar Markdown a partir da estrutura de dados
    const generateMarkdown = (node: any, level = 1) => {
      // Usar # para títulos com base no nível
      const heading = "#".repeat(Math.min(level, 6)) + " "
      let markdown = heading + node.name + "\n\n"

      // Processar filhos recursivamente
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => {
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

  // Função simplificada para exportar como PNG (apenas um placeholder)
  const exportAsPNG = () => {
    alert("Exportação para PNG desativada temporariamente. Será reativada no deploy.")
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="w-full h-[500px] border rounded-lg relative bg-white overflow-auto p-6"
        style={{
          backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="markdown-preview">
          {data ? (
            renderMarkdownStructure(data)
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">Nenhum dado disponível</div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportAsPNG} data-testid="export-png-button">
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
