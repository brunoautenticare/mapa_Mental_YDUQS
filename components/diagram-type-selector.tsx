"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface DiagramTypeSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function DiagramTypeSelector({ value, onChange }: DiagramTypeSelectorProps) {
  const diagramTypes = [
    { id: "logical-structure", label: "Estrutura lógica", icon: "🔄" },
    { id: "logical-structure-left", label: "Estrutura lógica (Esquerda)", icon: "🔄" },
    { id: "mind-map", label: "Mapa mental", icon: "🧠" },
    { id: "org-chart", label: "Estrutura organizacional", icon: "📊" },
    { id: "catalog", label: "Organização de catálogo", icon: "📑" },
    { id: "timeline", label: "Linha do tempo", icon: "⏱️" },
    { id: "vertical-timeline", label: "Linha do tempo vertical", icon: "⏱️" },
    { id: "fishbone", label: "Diagrama espinha de peixe", icon: "🐟" },
  ]

  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 gap-2">
      {diagramTypes.map((type) => (
        <div key={type.id} className="flex items-center space-x-2">
          <RadioGroupItem value={type.id} id={type.id} />
          <Label htmlFor={type.id} className="cursor-pointer flex items-center">
            <span className="mr-2">{type.icon}</span>
            {type.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}
