import { MindMapGenerator } from "@/components/mind-map-generator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <div className="flex justify-center mb-2">
            <span className="text-4xl">📝</span>
            <span className="text-4xl ml-2">🧠</span>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">Criador de Mapas Mentais</h1>
          <h2 className="text-2xl font-semibold mb-6">Visualize Qualquer Ideia</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gere ideias em mapas mentais claros e envolventes em segundos, de entradas de texto a tópicos complexos.
          </p>
        </section>

        <MindMapGenerator />

        <section className="mt-20 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Como Usar a Ferramenta de Mapeamento Mental</h2>
          <p className="text-lg text-center text-muted-foreground max-w-3xl mx-auto mb-8">
            Organize rapidamente ideias, descubra novas conexões e aumente sua produtividade em apresentações e
            explicações.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">✏️</div>
              <h3 className="text-xl font-semibold mb-2">Digite seu tópico</h3>
              <p className="text-muted-foreground">
                Insira o tema principal ou conceito que deseja explorar no mapa mental.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2">Adicione subtópicos</h3>
              <p className="text-muted-foreground">
                Expanda seu mapa adicionando ideias relacionadas e conexões entre conceitos.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">💾</div>
              <h3 className="text-xl font-semibold mb-2">Exporte e compartilhe</h3>
              <p className="text-muted-foreground">
                Salve seu mapa mental como imagem ou PDF para compartilhar com outras pessoas.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
