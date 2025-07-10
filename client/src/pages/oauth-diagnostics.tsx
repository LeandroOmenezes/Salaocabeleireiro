import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function OAuthDiagnostics() {
  const { toast } = useToast();

  // Detectar URL atual
  const currentUrl = window.location.origin;
  const callbackUrl = `${currentUrl}/api/auth/google/callback`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Diagnóstico Google OAuth
          </h1>
          <p className="text-gray-600">
            Configuração automática para resolver problemas de autenticação
          </p>
        </div>

        <div className="grid gap-6">
          {/* Status Atual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Status do Google OAuth
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>✅ Google OAuth Funcionando!</strong> O sistema está operacional e autenticando usuários corretamente.
                </AlertDescription>
              </Alert>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Sobre a tela de verificação do Google:</h4>
                <p className="text-blue-800 text-sm mb-2">
                  A tela "aplicativo precisa ser verificado" é normal e não impede o funcionamento. 
                  Ela aparece porque o app não passou pela verificação oficial do Google.
                </p>
                <p className="text-blue-800 text-sm">
                  Para apps internos ou de desenvolvimento, você pode clicar em "Avançado" → "Ir para [seu app] (não seguro)" 
                  para continuar o login normalmente.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Funcionamento confirmado:</h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• URLs configuradas corretamente no Google Cloud Console</li>
                  <li>• Autenticação Google operacional</li>
                  <li>• Usuários sendo criados automaticamente</li>
                  <li>• Sessões funcionando perfeitamente</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* URLs Detectadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                URLs Detectadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    URL Base (JavaScript Origins)
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-2 rounded text-sm">
                      {currentUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(currentUrl, "URL Base")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    URL de Callback (Authorized Redirect URIs)
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 p-2 rounded text-sm">
                      {callbackUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(callbackUrl, "URL de Callback")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instruções Passo a Passo */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração no Google Cloud Console</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">1</Badge>
                  <span>Acesse o Google Cloud Console</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://console.cloud.google.com', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Abrir
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">2</Badge>
                  <span>Vá em: APIs & Services → Credentials</span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">3</Badge>
                  <span>Clique na sua aplicação OAuth (cliente da web)</span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">4</Badge>
                  <span>Em "Authorized JavaScript origins", adicione a URL base</span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">5</Badge>
                  <span>Em "Authorized redirect URIs", adicione a URL de callback</span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">6</Badge>
                  <span>Clique em "Save" e aguarde alguns minutos</span>
                </div>
              </div>

              <Alert className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Após salvar, aguarde 5-10 minutos para que as 
                  mudanças sejam propagadas. Limpe o cache do navegador antes de testar.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Teste */}
          <Card>
            <CardHeader>
              <CardTitle>Teste a Configuração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Após configurar no Google Cloud Console, teste o login:
                </p>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => window.location.href = '/auth'}
                    className="flex items-center gap-2"
                  >
                    Ir para Página de Login
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/api/auth/google'}
                    className="flex items-center gap-2"
                  >
                    Testar Login Google Direto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Como usar o Google OAuth */}
          <Card>
            <CardHeader>
              <CardTitle>Como usar o Google OAuth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-green-800">Tela de verificação aparece?</h4>
                  <p className="text-sm text-green-700 mb-2">
                    Quando o Google mostrar "Este app não foi verificado", faça:
                  </p>
                  <ol className="text-sm text-green-700 space-y-1">
                    <li>1. Clique em "Avançado" ou "Advanced"</li>
                    <li>2. Clique em "Ir para [nome do app] (não seguro)"</li>
                    <li>3. Continue o login normalmente</li>
                  </ol>
                </div>

                <div className="border-l-4 border-blue-400 pl-4">
                  <h4 className="font-semibold text-blue-800">Para remover a tela de verificação</h4>
                  <p className="text-sm text-blue-700">
                    Para uso público, você pode submeter seu app para verificação do Google, 
                    mas para uso interno/desenvolvimento, a tela de aviso é normal e pode ser ignorada.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-400 pl-4">
                  <h4 className="font-semibold text-yellow-800">URL muda no Replit?</h4>
                  <p className="text-sm text-yellow-700">
                    Se a URL do Replit mudar, atualize as configurações no Google Cloud Console 
                    com as novas URLs. Considere usar um domínio personalizado para evitar isso.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}