import { memo } from "react"
import { Handle, Position } from "reactflow"

interface MindMapNodeProps {
  data: {
    label: string
    color: string
    shape: string
    diagramType: string
  }
  isConnectable: boolean
}

export const MindMapNode = memo(({ data, isConnectable }: MindMapNodeProps) => {
  const { label, color, shape, diagramType } = data

  // Determinar a posição das alças com base no tipo de diagrama
  const sourcePosition = getSourcePosition(diagramType)
  const targetPosition = getTargetPosition(diagramType)

  // Renderizar o nó com base na forma
  return (
    <>
      <Handle type="target" position={targetPosition} isConnectable={isConnectable} style={{ opacity: 0 }} />
      {renderNodeShape(shape, color, label)}
      <Handle type="source" position={sourcePosition} isConnectable={isConnectable} style={{ opacity: 0 }} />
    </>
  )
})

MindMapNode.displayName = "MindMapNode"

// Função para determinar a posição da alça de origem
function getSourcePosition(diagramType: string): Position {
  switch (diagramType) {
    case "logical-structure-left":
      return Position.Left
    case "org-chart":
    case "vertical-timeline":
      return Position.Bottom
    default:
      return Position.Right
  }
}

// Função para determinar a posição da alça de destino
function getTargetPosition(diagramType: string): Position {
  switch (diagramType) {
    case "logical-structure-left":
      return Position.Right
    case "org-chart":
    case "vertical-timeline":
      return Position.Top
    default:
      return Position.Left
  }
}

// Função para renderizar a forma do nó
function renderNodeShape(shape: string, color: string, label: string) {
  switch (shape) {
    case "rect":
      return (
        <div
          className="px-4 py-2 rounded-md text-white text-sm font-medium flex items-center justify-center min-w-[100px]"
          style={{ backgroundColor: color }}
        >
          {label}
        </div>
      )
    case "diamond":
      return (
        <div className="relative flex items-center justify-center" style={{ width: "80px", height: "80px" }}>
          <div
            className="absolute transform rotate-45"
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: color,
            }}
          />
          <div className="relative z-10 text-white text-xs font-medium text-center px-2">{label}</div>
        </div>
      )
    default: // circle
      return (
        <div className="flex flex-col items-center">
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: color,
            }}
          >
            <span className="text-white text-xs font-bold">{label.split(" ")[0]?.charAt(0) || ""}</span>
          </div>
          <div className="mt-1 text-xs text-center max-w-[100px] break-words">{label}</div>
        </div>
      )
  }
}
