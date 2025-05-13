"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { Transformer } from "markmap-lib"
import { Markmap } from "markmap-view"
import type { INode } from "markmap-common"

interface MarkmapViewerProps {
  data: any
  width?: string | number
  height?: string | number
  colorPalette?: string
}

export function MarkmapViewer({ data, width = "100%", height = 500, colorPalette = "default" }: MarkmapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const markmapRef = useRef<Markmap | null>(null)
  const [markdown, setMarkdown] = useState<string>("")

  // Função para obter cores com base na paleta selecionada
  const getColorsByPalette = (palette: string) => {
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

  // Converter a estrutura de dados em markdown
  useEffect(() => {
    if (!data) return

    // Função recursiva para gerar Markdown a partir da estrutura de dados
    const generateMarkdown = (node: any, level = 1) => {
      // Usar # para títulos com base no nível
      const heading = "#".repeat(Math.min(level, 6)) + " "
      let md = heading + node.name + "\n\n"

      // Processar filhos recursivamente
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => {
          md += generateMarkdown(child, level + 1)
        })
      }

      return md
    }

    // Gerar o conteúdo Markdown
    const markdownContent = generateMarkdown(data)
    setMarkdown(markdownContent)
  }, [data])

  // Renderizar o markmap quando o markdown mudar
  useEffect(() => {
    if (!svgRef.current || !markdown) return

    // Obter as cores da paleta selecionada
    const colors = getColorsByPalette(colorPalette)

    // Limpar SVG existente
    if (markmapRef.current) {
      // Se já existe um markmap, atualize-o
      try {
        const transformer = new Transformer()
        const { root } = transformer.transform(markdown)
        markmapRef.current.setData(root as INode)
        markmapRef.current.fit()
      } catch (error) {
        console.error("Erro ao atualizar markmap:", error)
      }
    } else {
      // Criar um novo markmap com configurações personalizadas
      try {
        const transformer = new Transformer()
        const { root } = transformer.transform(markdown)

        const mm = Markmap.create(
          svgRef.current,
          {
            autoFit: true,
            color: (node: any) => {
              // Cores baseadas no nível do nó
              const level = node.state.depth || 0
              return colors[level % colors.length]
            },
            duration: 500, // Duração da animação em ms
            nodeFont: "300 16px/20px sans-serif",
            nodeMinHeight: 16,
            spacingHorizontal: 80,
            spacingVertical: 5,
            initialExpandLevel: 2, // Expandir automaticamente até o nível 2
            linkShape: "diagonal", // Forma das linhas: 'diagonal' ou 'bracket'
            linkWidth: (node: any) => {
              // Largura da linha baseada no nível do nó
              const level = node.state.depth || 0
              return 3 - level * 0.5
            },
            paddingX: 8,
          },
          root as INode,
        )
        markmapRef.current = mm
      } catch (error) {
        console.error("Erro ao criar markmap:", error)
      }
    }

    // Cleanup
    return () => {
      // Não é necessário limpar o markmap, ele será substituído ou atualizado
    }
  }, [markdown, colorPalette])

  // Função para exportar o diagrama como Markdown
  const exportAsMarkdown = () => {
    if (!markdown) return

    // Criar um blob e fazer download
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "mind-map.md"
    link.click()
    URL.revokeObjectURL(url)
  }

  // Função para exportar como PNG
  const exportAsPNG = () => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const img = new Image()
    img.onload = () => {
      canvas.width = svgRef.current!.clientWidth * 2 // Maior resolução
      canvas.height = svgRef.current!.clientHeight * 2 // Maior resolução

      if (ctx) {
        // Desenhar fundo branco
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Desenhar o fundo pontilhado
        ctx.fillStyle = "#e5e7eb"
        for (let x = 0; x < canvas.width; x += 20) {
          for (let y = 0; y < canvas.height; y += 20) {
            ctx.beginPath()
            ctx.arc(x, y, 1, 0, 2 * Math.PI)
            ctx.fill()
          }
        }

        // Desenhar o SVG com escala 2x para melhor qualidade
        ctx.scale(2, 2)
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

  // Função para ajustar a visualização
  const handleFitView = () => {
    if (markmapRef.current) {
      markmapRef.current.fit()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="w-full h-[500px] border rounded-lg relative bg-white overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {data ? (
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
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">Nenhum dado disponível</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleFitView} disabled={!data}>
          Ajustar Visualização
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportAsPNG} disabled={!data} data-testid="export-png-button">
            <Download className="h-4 w-4 mr-2" />
            Exportar PNG
          </Button>
          <Button variant="outline" onClick={exportAsMarkdown} disabled={!data} data-testid="export-markdown-button">
            <FileText className="h-4 w-4 mr-2" />
            Exportar Markdown
          </Button>
        </div>
      </div>
    </div>
  )
}
