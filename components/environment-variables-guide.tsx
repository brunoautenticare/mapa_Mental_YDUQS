import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Steps, Step } from "@/components/ui/steps"

export function EnvironmentVariablesGuide() {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Para que o gerador de mapas mentais funcione corretamente, você precisa configurar a API key do Google AI como
          uma variável de ambiente no Vercel.
        </AlertDescription>
      </Alert>

      <Steps>
        <Step number={1} title="Acesse as configurações do projeto">
          <p>
            Na interface do Vercel, clique na aba <strong>Settings</strong> no menu superior do seu projeto.
          </p>
        </Step>

        <Step number={2} title="Encontre as variáveis de ambiente">
          <p>
            No menu lateral, procure e clique em <strong>Environment Variables</strong>.
          </p>
        </Step>

        <Step number={3} title="Adicione a API key">
          <div className="space-y-2">
            <p>Adicione uma nova variável de ambiente com os seguintes detalhes:</p>
            <div className="bg-muted p-3 rounded-md">
              <p>
                <strong>Nome:</strong> GOOGLE_AI_API_KEY
              </p>
              <p>
                <strong>Valor:</strong> [Sua chave de API do Google AI]
              </p>
            </div>
          </div>
        </Step>

        <Step number={4} title="Salve as alterações">
          <p>
            Clique no botão <strong>Save</strong> para salvar a variável de ambiente.
          </p>
        </Step>

        <Step number={5} title="Faça um novo deploy">
          <p>
            Após salvar, você precisará fazer um novo deploy para que as alterações entrem em vigor. Clique em{" "}
            <strong>Deployments</strong> no menu superior e depois em <strong>Redeploy</strong> no seu deployment mais
            recente.
          </p>
        </Step>
      </Steps>

      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-medium mb-2">Como obter uma API key do Google AI</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Acesse o{" "}
            <a href="https://ai.google.dev/" className="text-primary underline">
              Google AI Studio
            </a>
          </li>
          <li>Faça login com sua conta Google</li>
          <li>Vá para "API Keys" no menu</li>
          <li>Crie uma nova API key</li>
          <li>Copie a API key gerada</li>
        </ol>
      </div>
    </div>
  )
}
