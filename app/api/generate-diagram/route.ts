import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Inicializar o cliente da API do Google AI
const genAI = new GoogleGenerativeAI(process.env.CHAVE_API_DO_GOOGLE_AI || "")

export async function POST(request: Request) {
  try {
    const { prompt, diagramType, language } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt é obrigatório" }, { status: 400 })
    }

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

    // Gerar a resposta
    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    const text = response.text()

    // Extrair o JSON da resposta
    let jsonData
    try {
      // Tentar extrair o JSON da resposta (pode estar envolto em ```json ... ```)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/) || [null, text]
      const jsonString = jsonMatch[1] || text
      jsonData = JSON.parse(jsonString.trim())
    } catch (error) {
      console.error("Erro ao analisar JSON da resposta:", error)
      return NextResponse.json({ error: "Falha ao processar a resposta da IA" }, { status: 500 })
    }

    return NextResponse.json(jsonData)
  } catch (error) {
    console.error("Erro ao gerar diagrama:", error)
    return NextResponse.json({ error: `Falha ao gerar o diagrama: ${error.message}` }, { status: 500 })
  }
}
