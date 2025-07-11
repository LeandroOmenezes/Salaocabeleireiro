import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Upload, Trash2, Eye, Image } from "lucide-react";
import { Redirect, useLocation } from "wouter";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";

interface LoginBackground {
  id: number;
  backgroundImage: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LoginBackgroundManagement() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: loginBackground, isLoading: isLoadingBackground } = useQuery<LoginBackground>({
    queryKey: ["/api/login-background"],
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/login-background/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload da imagem');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/login-background"] });
      toast({
        title: "Sucesso",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeImageMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/login-background/image");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/login-background"] });
      toast({
        title: "Sucesso",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!user || !user.isAdmin) {
    return <Redirect to="/auth" />;
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um arquivo de imagem válido",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }

      uploadImageMutation.mutate(file);
    }
  };

  const handleRemoveImage = () => {
    if (window.confirm('Tem certeza que deseja remover a imagem de fundo do login?')) {
      removeImageMutation.mutate();
    }
  };

  const handleViewLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="font-sans bg-gray-100 text-gray-800 min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Gerenciar Fundo do Login
            </h1>
            <p className="text-gray-600">
              Configure a imagem de fundo da página de login para dar um toque personalizado
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Imagem de Fundo
                </CardTitle>
                <CardDescription>
                  Envie uma imagem para usar como fundo da página de login
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loginBackground?.backgroundImage ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={loginBackground.backgroundImage}
                        alt="Fundo do login atual"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleFileSelect}
                        disabled={uploadImageMutation.isPending}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadImageMutation.isPending ? "Enviando..." : "Trocar Imagem"}
                      </Button>
                      
                      <Button
                        variant="destructive"
                        onClick={handleRemoveImage}
                        disabled={removeImageMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">
                        Nenhuma imagem de fundo configurada
                      </p>
                      <Button
                        onClick={handleFileSelect}
                        disabled={uploadImageMutation.isPending}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadImageMutation.isPending ? "Enviando..." : "Enviar Imagem"}
                      </Button>
                    </div>
                  </div>
                )}

                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="text-sm text-gray-500">
                  <p>• Formatos aceitos: JPEG, PNG, WebP</p>
                  <p>• Tamanho máximo: 5MB</p>
                  <p>• Recomendado: imagens em paisagem com boa resolução</p>
                </div>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview & Ações
                </CardTitle>
                <CardDescription>
                  Veja como ficará e acesse a página de login
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {loginBackground?.backgroundImage ? (
                    <div className="relative">
                      <div 
                        className="w-full h-48 rounded-lg border bg-cover bg-center relative"
                        style={{ 
                          backgroundImage: `url(${loginBackground.backgroundImage})` 
                        }}
                      >
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                          <div className="text-white text-center">
                            <h3 className="text-lg font-semibold mb-2">Área do Cliente</h3>
                            <p className="text-sm opacity-90">Preview do fundo do login</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-lg border bg-gray-100 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Image className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Sem imagem de fundo</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      onClick={handleViewLogin}
                      className="w-full"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Página de Login
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Clique para ver como ficou na página real
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}