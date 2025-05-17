"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ColorPaletteSelector } from "@/components/color-palette-selector"
import { LayoutStyleSelector } from "@/components/layout-style-selector"
import { FileText, FileType, Globe, Youtube, Sparkles, Settings, Loader2, AlertCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { generateMindMap } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function MindMapGenerator() {
  const router = useRouter()
  const [inputText, setInputText] = useState("")
  const [language, setLanguage] = useState("português")
  const [isPending, startTransition] = useTransition()
  const [mindMapData, setMindMapData] = useState(null)
  const [diagramType, setDiagramType] = useState("mind-map")
  const [selectedPalette, setSelectedPalette] = useState("default")
  const [layoutStyle, setLayoutStyle] = useState("standard")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = () => {
    if (!inputText.trim()) return

    // Limpar erro anterior
    setError(null)

    const formData = new FormData()
    formData.append("prompt", inputText)
    formData.append("diagramType", diagramType)
    formData.append("language", language)

    startTransition(async () => {
      try {
        console.log("Iniciando geração do mapa mental...")
        const result = await generateMindMap(formData)

        if (result.error) {
          console.error("Erro retornado pela API:", result.error)
          setError(result.error)
          toast({
            title: "Erro",
            description: result.error,
            variant: "destructive",
          })
          return
        }

        if (result.data) {
          console.log("Mapa mental gerado com sucesso!")

          // Salvar dados no localStorage
          localStorage.setItem("mindMapData", JSON.stringify(result.data))
          localStorage.setItem(
            "mindMapSettings",
            JSON.stringify({
              diagramType,
              colorPalette: selectedPalette,
              layoutStyle,
              autoAdjustDisabled: true, // Adicionar esta linha
            }),
          )

          // Redirecionar para a página de visualização
          router.push("/view-map")

          toast({
            title: "Sucesso",
            description: "Mapa mental gerado com sucesso!",
          })
        }
      } catch (error) {
        console.error("Erro detalhado ao gerar mapa mental:", error)
        const errorMessage = error.message || "Falha ao gerar o mapa mental. Por favor, tente novamente."
        setError(errorMessage)
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        })
      }
    })
  }

  const examplePrompts = [
    { icon: <Globe className="w-4 h-4" />, text: "Estratégia de Marketing para Redes Sociais" },
    { icon: <FileText className="w-4 h-4" />, text: "Roteiro de viagem de 5 dias pela Tailândia" },
    { icon: <FileType className="w-4 h-4" />, text: "Dicas para comunicação eficiente" },
    { icon: <Youtube className="w-4 h-4" />, text: "Como ler um livro" },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <Tabs defaultValue="prompt">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="prompt" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Prompt Simples</span>
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>PDF / Doc</span>
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileType className="w-4 h-4" />
            <span>Texto Longo</span>
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Website</span>
          </TabsTrigger>
          <TabsTrigger value="youtube" className="flex items-center gap-2">
            <Youtube className="w-4 h-4" />
            <span>YouTube</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompt" className="mt-0">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="border rounded-lg p-4 mb-4">
            <Textarea
              placeholder="Descreva o que você quer gerar..."
              className="min-h-[150px] resize-none border-0 focus-visible:ring-0 p-0"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isPending}
            />
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-wrap gap-2">
                  <h5 className="text-sm font-medium flex items-center mr-2">Tipo de Diagrama:</h5>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "mind-map", label: "Mapa mental", icon: "🧠" },
                      { id: "logical-structure", label: "Estrutura lógica", icon: "🔄" },
                      { id: "logical-structure-left", label: "Estrutura lógica (Esq)", icon: "🔄" },
                      { id: "fishbone", label: "Espinha de peixe", icon: "🐟" },
                      { id: "markdown", label: "Markdown", icon: "📝" },
                      { id: "horizontal", label: "Horizontal", icon: "↔️" },
                    ].map((type) => (
                      <Button
                        key={type.id}
                        variant={diagramType === type.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDiagramType(type.id)}
                        className="flex items-center gap-1"
                        disabled={isPending}
                      >
                        <span>{type.icon}</span>
                        <span className="hidden sm:inline">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Select value={language} onValueChange={setLanguage} disabled={isPending}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="português">Português</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="español">Español</SelectItem>
                      </SelectContent>
                    </Select>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" disabled={isPending}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-medium">Configurações Avançadas</h4>
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Paleta de Cores</h5>
                            <ColorPaletteSelector value={selectedPalette} onChange={setSelectedPalette} />
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Estilo de Layout</h5>
                            <LayoutStyleSelector value={layoutStyle} onChange={setLayoutStyle} />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Button onClick={handleGenerate} disabled={!inputText.trim() || isPending} className="gap-2">
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Iniciar Geração
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {!mindMapData && !isPending && !error && (
            <>
              <div className="text-sm text-muted-foreground mb-4 text-center">Exemplos de Prompts</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examplePrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4"
                    onClick={() => setInputText(prompt.text)}
                  >
                    <div className="flex items-center gap-2">
                      {prompt.icon}
                      <span>{prompt.text}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </>
          )}

          {isPending && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gerando seu mapa mental...</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Estamos processando seu prompt com IA para criar um mapa mental personalizado. Isso pode levar alguns
                segundos.
              </p>
            </div>
          )}

          {/* Removido o código que exibia o mapa mental aqui */}
        </TabsContent>

        {/* Outras abas permanecem inalteradas */}
        <TabsContent value="pdf">
          <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Arraste e solte seu arquivo PDF ou DOC</h3>
            <p className="text-sm text-muted-foreground mb-4">Ou clique para selecionar um arquivo</p>
            <Button variant="outline">Selecionar Arquivo</Button>
          </div>
        </TabsContent>

        <TabsContent value="text">
          <Textarea placeholder="Cole seu texto longo aqui..." className="min-h-[300px]" />
          <Button className="mt-4 gap-2">
            <Sparkles className="w-4 h-4" />
            Gerar Mapa Mental
          </Button>
        </TabsContent>

        <TabsContent value="website">
          <div className="flex gap-4">
            <div className="flex-1">
              <Textarea placeholder="Cole a URL do website..." className="min-h-[100px]" />
            </div>
            <Button className="self-start gap-2">
              <Sparkles className="w-4 h-4" />
              Analisar
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="youtube">
          <div className="flex gap-4">
            <div className="flex-1">
              <Textarea placeholder="Cole a URL do vídeo do YouTube..." className="min-h-[100px]" />
            </div>
            <Button className="self-start gap-2">
              <Sparkles className="w-4 h-4" />
              Analisar
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
