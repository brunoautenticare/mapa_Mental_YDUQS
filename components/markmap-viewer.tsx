"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { Transformer } from "markmap-lib"
import { Markmap } from "markmap-view"
import { toPng } from "html-to-image"

interface MarkmapViewerProps {
  data: any
  height?: string | number
}

export function MarkmapViewer({ data, height = 500 }: MarkmapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const markmapRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Função para converter a estrutura de dados do mapa mental para formato Markdown
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

  // Efeito para renderizar o Markmap quando os dados mudam
  useEffect(() => {
    if (!data || !svgRef.current) return

    // Converter dados para Markdown
    const markdown = convertToMarkdown(data)

    // Criar transformador e processar o Markdown
    const transformer = new Transformer()
    const { root } = transformer.transform(markdown)

    // Limpar SVG existente
    if (svgRef.current) {
      svgRef.current.innerHTML = ""
    }

    // Criar novo Markmap
    if (svgRef.current) {
      const mm = Markmap.create(
        svgRef.current,
        {
          autoFit: true,
          color: (node: any) => {
            // Cores baseadas no nível do nó
            const colors = ["#4f46e5", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"]
            return colors[Math.min(node.depth, colors.length - 1)]
          },
        },
        root,
      )

      // Salvar referência ao Markmap
      markmapRef.current = mm
      setIsLoaded(true)
    }
  }, [data])

  // Função para exportar como PNG
  const exportAsPNG = async () => {
    if (!containerRef.current) return

    try {
      const dataUrl = await toPng(containerRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      })

      const link = document.createElement("a")
      link.download = "markmap.png"
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Erro ao exportar PNG:", error)
    }
  }

  // Função para exportar como Markdown
  const exportAsMarkdown = () => {
    if (!data) return

    const markdown = convertToMarkdown(data)
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "markmap.md"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="w-full border rounded-lg relative bg-white overflow-hidden"
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
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
      </div>

      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportAsPNG} disabled={!isLoaded}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PNG
          </Button>
          <Button variant="outline" onClick={exportAsMarkdown} disabled={!isLoaded}>
            <FileText className="h-4 w-4 mr-2" />
            Exportar Markdown
          </Button>
        </div>
      </div>
    </div>
  )
}
