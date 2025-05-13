"use client"

import { useEffect, useRef } from "react"
import { Transformer } from "markmap-lib"
import { Markmap } from "markmap-view"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

interface MarkmapViewerProps {
  data: any
  width?: string | number
  height?: string | number
  onExportMarkdown?: () => void
}

export function MarkmapViewer({ data, width = "100%", height = 500, onExportMarkdown }: MarkmapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markmapRef = useRef<Markmap | null>(null)

  useEffect(() => {
    if (!svgRef.current || !data) return

    // Limpar SVG existente
    svgRef.current.innerHTML = ""

    // Converter dados para formato Markmap
    const transformer = new Transformer()
    const markdownText = convertToMarkdown(data)
    const { root } = transformer.transform(markdownText)

    // Criar e renderizar o Markmap
    markmapRef.current = Markmap.create(
      svgRef.current,
      {
        // Adicionando estilos inline para substituir a necessidade do CSS externo
        style: `
        .markmap-node {
          cursor: pointer;
        }
        .markmap-node-circle {
          fill: #fff;
          stroke-width: 1.5;
        }
        .markmap-node-text {
          fill: #000;
          font: 10px sans-serif;
        }
        .markmap-link {
          fill: none;
        }
      `,
      },
      root,
    )

    // Ajustar visualização
    setTimeout(() => {
      if (markmapRef.current) {
        markmapRef.current.fit()
      }
    }, 100)

    return () => {
      if (markmapRef.current) {
        // Limpar recursos se necessário
      }
    }
  }, [data])

  // Função para converter dados do mapa mental para formato Markdown
  const convertToMarkdown = (node: any, level = 0): string => {
    if (!node) return ""

    // Criar cabeçalho Markdown com base no nível
    const heading = "#".repeat(level + 1)
    let markdown = `${heading} ${node.name}\n\n`

    // Processar filhos recursivamente
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        markdown += convertToMarkdown(child, level + 1)
      })
    }

    return markdown
  }

  // Função para exportar o diagrama como PNG
  const exportAsPNG = () => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const img = new Image()
    img.onload = () => {
      // Definir dimensões do canvas
      const svgRect = svgRef.current?.getBoundingClientRect() || { width: 800, height: 500 }
      canvas.width = svgRect.width
      canvas.height = svgRect.height

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
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="w-full h-[500px] border rounded-lg relative bg-white overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <svg ref={svgRef} width={width} height={height} className="w-full h-full" style={{ minHeight: "400px" }} />
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
