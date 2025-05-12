import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: Request) {
  try {
    // Verificar se a chave API está disponível
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.CHAVE_API_DO_GOOGLE_AI

    if (!apiKey) {
      console.error("Chave de API do Google AI não encontrada nas variáveis de ambiente")
      return NextResponse.json(
        { error: "Configuração do servidor incompleta: Chave de API não encontrada" },
        { status: 500 },
      )
    }

    // Inicializar o cliente da API do Google AI
    const genAI = new GoogleGenerativeAI(apiKey)

    const { prompt, diagramType, language } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 })
    }

    console.log(`Processando solicitação: ${diagramType} em ${language}`)

    // Selecionar o modelo Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Criar um prompt estruturado para o modelo
    const systemPrompt = `
      Você é um especialista em criar estruturas de mapas mentais e diagramas.
      Crie um diagrama do tipo "${diagramType}" em ${language} baseado no seguinte tópico: "${prompt}".
      
      Retorne apenas um objeto JSON com a seguinte estrutura:
      {
        "id": "root",
        "name": "Título principal (curto e conciso)",
        "children": [
          {
            "id": "1",
            "name": "Tópico 1",
            "children": [
              { "id": "1-1", "name": "Subtópico 1.1" },
              { "id": "1-2", "name": "Subtópico 1.2" }
            ]
          },
          {
            "id": "2",
            "name": "Tópico 2",
            "children": [...]
          }
        ]
      }
      
      Regras importantes:
      1. O título principal deve ser curto (máximo 30 caracteres)
      2. Cada tópico e subtópico deve ser conciso (máximo 25 caracteres)
      3. Crie entre 3 e 5 tópicos principais
      4. Cada tópico deve ter entre 2 e 4 subtópicos
      5. Não inclua explicações ou texto adicional, apenas o objeto JSON
      6. Não use aspas simples, apenas aspas duplas no JSON
      7. Adapte a estrutura conforme o tipo de diagrama solicitado
    `

    try {
      // Gerar a resposta
      const result = await model.generateContent(systemPrompt)
      const response = await result.response
      const text = response.text()

      // Extrair o JSON da resposta
      let jsonData
      try {
        // Tentar extrair o JSON da resposta (pode estar envolto em \`\`\`json ... \`\`\`)
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
          text.match(/```\s*([\s\S]*?)\s*```/) || [null, text]
        const jsonString = jsonMatch[1] || text
        jsonData = JSON.parse(jsonString.trim())

        console.log("Diagrama gerado com sucesso")
        return NextResponse.json(jsonData)
      } catch (error) {
        console.error("Erro ao analisar JSON da resposta:", error)
        return NextResponse.json(
          {
            error: "Falha ao processar a resposta da IA: formato JSON inválido",
            rawResponse: text.substring(0, 200) + "...", // Incluir parte da resposta para depuração
          },
          { status: 500 },
        )
      }
    } catch (error) {
      console.error("Erro na chamada da API do Google AI:", error)
      return NextResponse.json(
        {
          error: `Erro na API do Google AI: ${error.message || "Erro desconhecido"}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erro geral ao gerar diagrama:", error)
    return NextResponse.json(
      {
        error: `Falha ao processar a solicitação: ${error.message || "Erro desconhecido"}`,
      },
      { status: 500 },
    )
  }
}
