export async function generateDiagramWithAI(prompt: string, diagramType: string, language: string) {
  try {
    // Determinar a URL base para a API de forma mais robusta
    let baseUrl = ""

    // Verificar se estamos no navegador
    if (typeof window !== "undefined") {
      // Usar a origem da janela atual como URL base
      baseUrl = window.location.origin
    } else if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      // Em ambiente Vercel, usar a URL do Vercel (sem adicionar https:// se já estiver incluído)
      const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      baseUrl = vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`
    }

    // Garantir que a URL seja construída corretamente
    const apiUrl = new URL("/api/generate-diagram", baseUrl).toString()

    console.log(`Fazendo requisição para: ${apiUrl}`)

    const response = await fetch(apiUrl, {
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
      const errorData = await response.json().catch(() => ({ error: `Status HTTP: ${response.status}` }))
      throw new Error(errorData.error || `Falha na requisição: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Erro detalhado no serviço de IA:", error)
    throw new Error(`Falha ao conectar com o serviço de IA: ${error.message}`)
  }
}
