"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ChevronDown,
  BrainCircuit,
  GitBranch,
  Fish,
  FileText,
  ArrowUpWideNarrowIcon as ArrowsHorizontal,
} from "lucide-react"

interface DiagramSelectorFloatingProps {
  currentType: string
  onTypeChange: (type: string) => void
}

export function DiagramSelectorFloating({ currentType, onTypeChange }: DiagramSelectorFloatingProps) {
  const [isOpen, setIsOpen] = useState(false)

  const diagramTypes = [
    { id: "mind-map", label: "Mapa mental", icon: <BrainCircuit className="h-4 w-4 mr-2" /> },
    { id: "logical-structure", label: "Estrutura lógica", icon: <GitBranch className="h-4 w-4 mr-2" /> },
    {
      id: "logical-structure-left",
      label: "Estrutura lógica (Esq)",
      icon: <GitBranch className="h-4 w-4 mr-2 transform rotate-180" />,
    },
    { id: "fishbone", label: "Espinha de peixe", icon: <Fish className="h-4 w-4 mr-2" /> },
    { id: "markdown", label: "Markdown", icon: <FileText className="h-4 w-4 mr-2" /> },
    { id: "horizontal", label: "Horizontal", icon: <ArrowsHorizontal className="h-4 w-4 mr-2" /> },
  ]

  const currentDiagram = diagramTypes.find((type) => type.id === currentType) || diagramTypes[0]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-white/80 backdrop-blur-sm shadow-md hover:bg-white/90 flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          {currentDiagram.icon}
          {currentDiagram.label}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        {diagramTypes.map((type) => (
          <DropdownMenuItem
            key={type.id}
            className={`flex items-center ${currentType === type.id ? "bg-muted" : ""}`}
            onClick={() => {
              onTypeChange(type.id)
              setIsOpen(false)
            }}
          >
            {type.icon}
            {type.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
