export async function generateDiagramWithAI(prompt: string, diagramType: string, language: string) {
  try {
    const response = await fetch("/api/generate-diagram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        diagramType,
        language,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Falha ao gerar o diagrama")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro no serviço de IA:", error)
    throw error
  }
}
