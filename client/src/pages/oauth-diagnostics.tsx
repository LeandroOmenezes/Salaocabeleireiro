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
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Status do Problema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erro:</strong> redirect_uri_mismatch - A URL de callback não está autorizada no Google Cloud Console
                </AlertDescription>
              </Alert>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">O que está acontecendo:</h4>
                <p className="text-red-800 text-sm">
                  O Google está tentando redirecionar para uma URL que não foi configurada 
                  como autorizada no Google Cloud Console. Você precisa adicionar a URL 
                  atual do seu app.
                </p>
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

          {/* Problemas Comuns */}
          <Card>
            <CardHeader>
              <CardTitle>Problemas Comuns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-400 pl-4">
                  <h4 className="font-semibold text-yellow-800">URL muda frequentemente no Replit</h4>
                  <p className="text-sm text-yellow-700">
                    Se a URL do Replit mudar, você precisará atualizar novamente no Google Cloud Console.
                    Considere usar um domínio personalizado para evitar isso.
                  </p>
                </div>

                <div className="border-l-4 border-red-400 pl-4">
                  <h4 className="font-semibold text-red-800">Erro persiste após configurar</h4>
                  <p className="text-sm text-red-700">
                    Aguarde alguns minutos, limpe o cache do navegador e tente novamente.
                    Verifique se as URLs estão exatamente como mostradas acima.
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