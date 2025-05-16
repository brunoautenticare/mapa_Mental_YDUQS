"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Palette } from "lucide-react"

interface ColorPaletteSelectorFloatingProps {
  currentPalette: string
  onPaletteChange: (palette: string) => void
}

export function ColorPaletteSelectorFloating({ currentPalette, onPaletteChange }: ColorPaletteSelectorFloatingProps) {
  const [isOpen, setIsOpen] = useState(false)

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

  const currentColorPalette = colorPalettes.find((palette) => palette.id === currentPalette) || colorPalettes[0]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-white/80 backdrop-blur-sm shadow-md hover:bg-white/90 flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <Palette className="h-4 w-4 mr-1" />
          <div className="flex mr-2">
            {currentColorPalette.colors.slice(0, 4).map((color, index) => (
              <div key={index} className="w-3 h-3 border border-gray-200" style={{ backgroundColor: color }} />
            ))}
          </div>
          {currentColorPalette.label}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        {colorPalettes.map((palette) => (
          <DropdownMenuItem
            key={palette.id}
            className={`flex items-center ${currentPalette === palette.id ? "bg-muted" : ""}`}
            onClick={() => {
              onPaletteChange(palette.id)
              setIsOpen(false)
            }}
          >
            <div className="flex mr-2">
              {palette.colors.slice(0, 4).map((color, index) => (
                <div key={index} className="w-3 h-3 border border-gray-200" style={{ backgroundColor: color }} />
              ))}
            </div>
            {palette.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
