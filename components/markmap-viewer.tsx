"use client"

import { useEffect, useRef } from "react"
import { Transformer } from "markmap-lib"
import { Markmap } from "markmap-view"
// Removendo a importação direta do CSS que está causando o erro
// import "markmap-view/style/view.css"

interface MarkmapViewerProps {
  data: any
  width?: string | number
  height?: string | number
}

export function MarkmapViewer({ data, width = "100%", height = 500 }: MarkmapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
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

  return (
    <div className="w-full" style={{ height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full border rounded-lg bg-white"
        style={{ minHeight: "400px" }}
      />
    </div>
  )
}
