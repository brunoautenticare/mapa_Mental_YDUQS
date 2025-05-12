"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface LayoutStyleSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function LayoutStyleSelector({ value, onChange }: LayoutStyleSelectorProps) {
  const layoutStyles = [
    { id: "standard", label: "Padrão", icon: "⊙─⊙" },
    { id: "rect", label: "Retangular", icon: "□─□" },
    { id: "diamond", label: "Diamante", icon: "◇─◇" },
  ]

  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-3 gap-2">
      {layoutStyles.map((style) => (
        <div key={style.id} className="flex flex-col items-center">
          <div
            className={`border rounded-lg p-4 w-full flex items-center justify-center ${value === style.id ? "border-primary" : "border-gray-200"}`}
          >
            <span className="text-lg">{style.icon}</span>
          </div>
          <div className="flex items-center mt-2">
            <RadioGroupItem value={style.id} id={style.id} className="mr-2" />
            <Label htmlFor={style.id} className="cursor-pointer">
              {style.label}
            </Label>
          </div>
        </div>
      ))}
    </RadioGroup>
  )
}
