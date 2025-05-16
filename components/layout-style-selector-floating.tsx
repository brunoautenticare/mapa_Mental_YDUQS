"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, LayoutTemplate } from "lucide-react"

interface LayoutStyleSelectorFloatingProps {
  currentStyle: string
  onStyleChange: (style: string) => void
}

export function LayoutStyleSelectorFloating({ currentStyle, onStyleChange }: LayoutStyleSelectorFloatingProps) {
  const [isOpen, setIsOpen] = useState(false)

  const layoutStyles = [
    { id: "standard", label: "Padrão", icon: "⊙" },
    { id: "rect", label: "Retangular", icon: "□" },
    { id: "diamond", label: "Diamante", icon: "◇" },
  ]

  const currentLayoutStyle = layoutStyles.find((style) => style.id === currentStyle) || layoutStyles[0]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-white/80 backdrop-blur-sm shadow-md hover:bg-white/90 flex items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <LayoutTemplate className="h-4 w-4 mr-1" />
          <span className="mr-1">{currentLayoutStyle.icon}</span>
          {currentLayoutStyle.label}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-40">
        {layoutStyles.map((style) => (
          <DropdownMenuItem
            key={style.id}
            className={`flex items-center ${currentStyle === style.id ? "bg-muted" : ""}`}
            onClick={() => {
              onStyleChange(style.id)
              setIsOpen(false)
            }}
          >
            <span className="mr-2 text-lg">{style.icon}</span>
            {style.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
