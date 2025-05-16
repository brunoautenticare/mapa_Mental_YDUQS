import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <h2 className="text-xl font-medium">Carregando mapa mental...</h2>
        <p className="text-muted-foreground">Preparando a visualização do seu mapa</p>
      </div>
    </div>
  )
}
