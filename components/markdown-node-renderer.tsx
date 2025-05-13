import { memo } from "react"

interface MarkdownNodeProps {
  node: {
    id: string
    name: string
    depth: number
    children?: any[]
  }
  colors: string[]
}

export const MarkdownNodeRenderer = memo(({ node, colors }: MarkdownNodeProps) => {
  // Determinar o nível de cabeçalho com base na profundidade
  const headingLevel = Math.min(node.depth + 1, 6)
  const headingSymbol = "#".repeat(headingLevel)
  const color = colors[node.depth % colors.length]

  return (
    <div className="flex items-start">
      <div className="font-mono mr-2 font-bold" style={{ color }}>
        {headingSymbol}
      </div>
      <div className="font-medium">{node.name}</div>
    </div>
  )
})

MarkdownNodeRenderer.displayName = "MarkdownNodeRenderer"
