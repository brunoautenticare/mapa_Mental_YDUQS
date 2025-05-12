export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-lg">M</span>
            </div>
            <span className="font-semibold">MindMap</span>
          </div>

          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Termos
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </a>
          </div>
        </div>
        <div className="text-center mt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} MindMap. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
