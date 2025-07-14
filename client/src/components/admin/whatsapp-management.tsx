import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, MessageCircle, CheckCircle, XCircle, Send, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WhatsAppStatus {
  success: boolean;
  message: string;
}

export function WhatsAppManagement() {
  const { toast } = useToast();
  const [testPhone, setTestPhone] = useState("");
  const [testName, setTestName] = useState("");

  // Verificar status do WhatsApp
  const { data: whatsappStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<WhatsAppStatus>({
    queryKey: ["/api/admin/whatsapp/test"],
    retry: false
  });

  // Mutation para enviar mensagem de teste
  const testMessageMutation = useMutation({
    mutationFn: async (data: { phone: string; clientName: string }) => {
      const res = await apiRequest("POST", "/api/admin/whatsapp/test-message", data);
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Sucesso!",
          description: data.message,
        });
      } else {
        toast({
          title: "Erro",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTestMessage = () => {
    if (!testPhone || !testName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o telefone e nome para o teste",
        variant: "destructive",
      });
      return;
    }

    // Validar formato do telefone
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(testPhone.replace(/\s/g, ''))) {
      toast({
        title: "Telefone inválido",
        description: "Use o formato internacional: +5511999999999",
        variant: "destructive",
      });
      return;
    }

    testMessageMutation.mutate({
      phone: testPhone.startsWith('+') ? testPhone : `+55${testPhone}`,
      clientName: testName
    });
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">Notificações WhatsApp</h1>
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {whatsappStatus?.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Status da Configuração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              {whatsappStatus?.message || "Status desconhecido"}
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <Button 
              onClick={() => refetchStatus()} 
              variant="outline"
              disabled={statusLoading}
            >
              {statusLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Verificar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Como Configurar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium">1. Criar conta Twilio:</h4>
              <p className="text-gray-600">
                Acesse <a href="https://www.twilio.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">twilio.com</a> e crie uma conta gratuita
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">2. Configurar WhatsApp Sandbox:</h4>
              <p className="text-gray-600">
                No console Twilio, vá em Messaging → Try it out → Send a WhatsApp message
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">3. Adicionar variáveis de ambiente:</h4>
              <div className="bg-gray-100 p-3 rounded-lg font-mono text-xs">
                <div>TWILIO_ACCOUNT_SID=your_account_sid</div>
                <div>TWILIO_AUTH_TOKEN=your_auth_token</div>
                <div>TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teste de Mensagem */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Teste de Mensagem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testPhone">Telefone (formato internacional)</Label>
              <Input
                id="testPhone"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+5511999999999"
                disabled={testMessageMutation.isPending}
              />
            </div>
            
            <div>
              <Label htmlFor="testName">Nome do Cliente</Label>
              <Input
                id="testName"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="João Silva"
                disabled={testMessageMutation.isPending}
              />
            </div>
            
            <Button 
              onClick={handleTestMessage}
              disabled={testMessageMutation.isPending || !whatsappStatus?.success}
              className="w-full"
            >
              {testMessageMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Phone className="mr-2 h-4 w-4" />
              )}
              Enviar Mensagem de Teste
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Funcionamento Automático */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionamento Automático</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <strong>Confirmação de Agendamento:</strong> Cliente recebe WhatsApp automaticamente quando admin confirma o agendamento
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <strong>Cancelamento:</strong> Cliente é notificado se o agendamento for cancelado
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <strong>Informações incluídas:</strong> Nome do cliente, serviço, data, horário e instruções
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}