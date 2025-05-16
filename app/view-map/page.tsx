"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MindMap } from "@/components/mind-map"
import { HorizontalMindMap } from "@/components/horizontal-mind-map"
import { MarkmapViewer } from "@/components/markmap-viewer"

export default function ViewMap() {
  const router = useRouter()
  const [mapData, setMapData] = useState(null)
  const [settings, setSettings] = useState({
    diagramType: "mind-map",
    colorPalette: "default",
    layoutStyle: "standard",
  })

  useEffect(() => {
    // Carregar dados do localStorage
    try {
      const storedData = localStorage.getItem("mindMapData")
      const storedSettings = localStorage.getItem("mindMapSettings")

      if (storedData) {
        setMapData(JSON.parse(storedData))
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }, [])

  const handleBackClick = () => {
    router.push("/")
  }

  if (!mapData) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl">Nenhum mapa mental encontrado</p>
          <Button onClick={handleBackClick}>Voltar para a página inicial</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full">
      {/* Botão de voltar */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 left-4 z-50 bg-white/80 backdrop-blur-sm shadow-md hover:bg-white/90"
        onClick={handleBackClick}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Voltar</span>
      </Button>

      {/* Mapa mental em tela cheia */}
      <div className="absolute inset-0">
        {settings.diagramType === "horizontal" ? (
          <HorizontalMindMap data={mapData} colorPalette={settings.colorPalette} fullscreen={true} />
        ) : settings.diagramType === "markdown" ? (
          <MarkmapViewer data={mapData} fullscreen={true} />
        ) : (
          <MindMap
            data={mapData}
            diagramType={settings.diagramType}
            colorPalette={settings.colorPalette}
            layoutStyle={settings.layoutStyle}
            fullscreen={true}
          />
        )}
      </div>
    </div>
  )
}
