"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MindMap } from "@/components/mind-map"
import { ColorPaletteSelector } from "@/components/color-palette-selector"
import { LayoutStyleSelector } from "@/components/layout-style-selector"
import { FileText, FileType, Globe, Youtube, Sparkles, Settings } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function MindMapGenerator() {
  const [inputText, setInputText] = useState("")
  const [language, setLanguage] = useState("português")
  const [isGenerating, setIsGenerating] = useState(false)
  const [mindMapData, setMindMapData] = useState(null)
  const [diagramType, setDiagramType] = useState("mind-map")
  const [selectedPalette, setSelectedPalette] = useState("default")
  const [layoutStyle, setLayoutStyle] = useState("standard")

  const handleGenerate = () => {
    if (!inputText.trim()) return

    setIsGenerating(true)

    // Simulando o tempo de processamento
    setTimeout(() => {
      // Dados de exemplo para o mapa mental
      const data = {
        id: "root",
        name: inputText.split(" ").slice(0, 3).join(" "),
        children: [
          {
            id: "1",
            name: "Tópico 1",
            children: [
              { id: "1-1", name: "Subtópico 1.1" },
              { id: "1-2", name: "Subtópico 1.2" },
            ],
          },
          {
            id: "2",
            name: "Tópico 2",
            children: [
              { id: "2-1", name: "Subtópico 2.1" },
              { id: "2-2", name: "Subtópico 2.2" },
            ],
          },
          {
            id: "3",
            name: "Tópico 3",
            children: [
              { id: "3-1", name: "Subtópico 3.1" },
              { id: "3-2", name: "Subtópico 3.2" },
            ],
          },
        ],
      }

      setMindMapData(data)
      setIsGenerating(false)
    }, 1500)
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
          <div className="border rounded-lg p-4 mb-4">
            <Textarea
              placeholder="Descreva o que você quer gerar..."
              className="min-h-[150px] resize-none border-0 focus-visible:ring-0 p-0"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
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
                      { id: "org-chart", label: "Estrutura organizacional", icon: "📊" },
                      { id: "catalog", label: "Organização de catálogo", icon: "📑" },
                      { id: "timeline", label: "Linha do tempo", icon: "⏱️" },
                      { id: "vertical-timeline", label: "Linha do tempo vertical", icon: "⏱️" },
                      { id: "fishbone", label: "Espinha de peixe", icon: "🐟" },
                    ].map((type) => (
                      <Button
                        key={type.id}
                        variant={diagramType === type.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDiagramType(type.id)}
                        className="flex items-center gap-1"
                      >
                        <span>{type.icon}</span>
                        <span className="hidden sm:inline">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Select value={language} onValueChange={setLanguage}>
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
                        <Button variant="outline" size="icon">
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

                  <Button onClick={handleGenerate} disabled={!inputText.trim() || isGenerating} className="gap-2">
                    {isGenerating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
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

          {!mindMapData && (
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

          {mindMapData && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Seu Mapa Mental</h3>
              </div>
              <MindMap
                data={mindMapData}
                diagramType={diagramType}
                colorPalette={selectedPalette}
                layoutStyle={layoutStyle}
              />
            </div>
          )}
        </TabsContent>

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
