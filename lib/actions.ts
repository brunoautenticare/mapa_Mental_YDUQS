"use server"

import { generateDiagramWithAI } from "@/lib/ai-service"

export async function generateMindMap(formData: FormData) {
  try {
    const prompt = formData.get("prompt") as string
    const diagramType = formData.get("diagramType") as string
    const language = formData.get("language") as string

    if (!prompt || !diagramType || !language) {
      return {
        error: "Todos os campos são obrigatórios",
      }
    }

    const data = await generateDiagramWithAI(prompt, diagramType, language)
    return { data }
  } catch (error) {
    console.error("Erro ao gerar mapa mental:", error)
    return {
      error: error.message || "Falha ao gerar o mapa mental. Por favor, tente novamente.",
    }
  }
}
