"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface ColorPaletteSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function ColorPaletteSelector({ value, onChange }: ColorPaletteSelectorProps) {
  const colorPalettes = [
    { id: "default", label: "Padrão", colors: ["#4f46e5", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"] },
    { id: "blue", label: "Azul", colors: ["#1e40af", "#3b82f6", "#93c5fd", "#dbeafe"] },
    { id: "green", label: "Verde", colors: ["#166534", "#22c55e", "#86efac", "#dcfce7"] },
    { id: "red", label: "Vermelho", colors: ["#991b1b", "#ef4444", "#fca5a5", "#fee2e2"] },
    { id: "purple", label: "Roxo", colors: ["#6b21a8", "#a855f7", "#d8b4fe", "#f3e8ff"] },
    { id: "orange", label: "Laranja", colors: ["#9a3412", "#f97316", "#fdba74", "#ffedd5"] },
    { id: "rainbow", label: "Arco-íris", colors: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7"] },
    { id: "pastel", label: "Pastel", colors: ["#f87171", "#fdba74", "#fde047", "#86efac", "#93c5fd", "#d8b4fe"] },
    { id: "earth", label: "Terra", colors: ["#78350f", "#a16207", "#15803d", "#166534", "#1e3a8a"] },
  ]

  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 gap-2">
      {colorPalettes.map((palette) => (
        <div key={palette.id} className="flex items-center space-x-2">
          <RadioGroupItem value={palette.id} id={palette.id} />
          <Label htmlFor={palette.id} className="flex items-center cursor-pointer">
            <div className="flex mr-2">
              {palette.colors.map((color, index) => (
                <div key={index} className="w-4 h-4 border border-gray-200" style={{ backgroundColor: color }} />
              ))}
            </div>
            {palette.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )
}
