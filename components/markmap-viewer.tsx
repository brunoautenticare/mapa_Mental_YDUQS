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
  fullscreen?: boolean
}

export function MarkmapViewer({ data, width = "100%", height = 500, fullscreen = false }: MarkmapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const markmapRef = useRef<Markmap | null>(null)
  const [markdown, setMarkdown] = useState<string>("")

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

    // Limpar SVG existente
    if (markmapRef.current) {
      // Se já existe um markmap, atualize-o
      try {
        const transformer = new Transformer()
        const { root } = transformer.transform(markdown)
        markmapRef.current.setData(root as INode)
        // markmapRef.current.fit() - removido para evitar o autoajuste
      } catch (error) {
        console.error("Erro ao atualizar markmap:", error)
      }
    } else {
      // Criar um novo markmap
      try {
        const transformer = new Transformer()
        const { root } = transformer.transform(markdown)
        const mm = Markmap.create(
          svgRef.current,
          {
            autoFit: false, // Desativar o autoajuste
            color: (node: any) => {
              // Cores baseadas no nível do nó
              const colors = ["#4f46e5", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"]
              const level = node.state.depth || 0
              return colors[level % colors.length]
            },
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
  }, [markdown])

  // Efeito para centralizar o markmap após a renderização inicial
  useEffect(() => {
    if (markmapRef.current && markdown) {
      // Pequeno atraso para garantir que o markmap foi renderizado completamente
      const timer = setTimeout(() => {
        try {
          // Centralizar o markmap sem animação
          markmapRef.current.fit({ duration: 0, padding: [50, 20] })
        } catch (error) {
          console.error("Erro ao centralizar markmap:", error)
        }
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [markdown])

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

  return (
    <div className={`flex flex-col gap-4 ${fullscreen ? "h-screen" : ""}`}>
      <div
        className={`${fullscreen ? "w-full h-full" : "w-full h-[500px]"} border rounded-lg relative bg-white overflow-hidden`}
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

        {/* Botões de exportação flutuantes quando em modo tela cheia */}
        {fullscreen && data && (
          <div className="absolute top-4 right-4 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
            <Button variant="outline" onClick={exportAsPNG} data-testid="export-png-button" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar PNG
            </Button>
            <Button variant="outline" onClick={exportAsMarkdown} data-testid="export-markdown-button" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Exportar Markdown
            </Button>
          </div>
        )}
      </div>

      {/* Controles fixos quando não estiver em modo tela cheia */}
      {!fullscreen && data && (
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
      )}
    </div>
  )
}
