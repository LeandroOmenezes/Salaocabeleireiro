import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Eye, Settings, Palette, FileText, Image } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { insertSiteConfigSchema, type SiteConfig } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

const siteConfigFormSchema = insertSiteConfigSchema.extend({
  siteName: z.string().min(1, "Nome do site é obrigatório"),
  siteSlogan: z.string().min(1, "Slogan do site é obrigatório"),
  primaryColor: z.string().min(1, "Cor principal é obrigatória"),
  logoUrl: z.string().optional()
});

export default function SiteConfigManagement() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Buscar configuração atual do site
  const { data: config, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["/api/site-config"],
    queryFn: async () => {
      const response = await fetch("/api/site-config");
      if (!response.ok) throw new Error("Erro ao buscar configuração do site");
      return response.json() as Promise<SiteConfig>;
    }
  });

  const form = useForm<z.infer<typeof siteConfigFormSchema>>({
    resolver: zodResolver(siteConfigFormSchema),
    defaultValues: {
      siteName: config?.siteName || "",
      siteSlogan: config?.siteSlogan || "",
      primaryColor: config?.primaryColor || "#3b82f6",
      logoUrl: config?.logoUrl || ""
    }
  });

  // Atualizar valores padrão quando os dados chegarem
  React.useEffect(() => {
    if (config) {
      form.reset({
        siteName: config.siteName,
        siteSlogan: config.siteSlogan,
        primaryColor: config.primaryColor,
        logoUrl: config.logoUrl
      });
    }
  }, [config, form]);

  const updateConfigMutation = useMutation({
    mutationFn: async (data: z.infer<typeof siteConfigFormSchema>) => {
      const response = await apiRequest("PUT", "/api/site-config", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-config"] });
      toast({
        title: "Configuração atualizada",
        description: "As configurações do site foram atualizadas com sucesso!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar configuração",
        description: error.message || "Ocorreu um erro ao atualizar as configurações do site",
        variant: "destructive"
      });
    }
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      
      const response = await fetch("/api/site-config/upload-logo", {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao fazer upload da logo");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedLogoUrl(data.logoUrl);
      queryClient.invalidateQueries({ queryKey: ["/api/site-config"] });
      toast({
        title: "Logo atualizada",
        description: "A logo do site foi atualizada com sucesso!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no upload",
        description: error.message || "Erro ao fazer upload da logo",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A logo deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas imagens são permitidas",
          variant: "destructive"
        });
        return;
      }
      
      setIsUploading(true);
      uploadLogoMutation.mutate(file);
    }
  };

  const onSubmit = (data: z.infer<typeof siteConfigFormSchema>) => {
    updateConfigMutation.mutate(data);
  };

  if (isLoadingConfig) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configurações do Site</h1>
          <p className="text-muted-foreground">
            Personalize o nome, logo e cores do seu site
          </p>
        </div>

        <div className="grid gap-6">
          {/* Configuração Geral */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuração Geral
              </CardTitle>
              <CardDescription>
                Configure o nome e slogan do seu site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Site</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Salão de Beleza Premium"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Principal</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input 
                                type="color"
                                className="w-20 h-10"
                                {...field}
                              />
                              <Input 
                                placeholder="#3b82f6"
                                className="flex-1"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="siteSlogan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slogan do Site</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ex: Transformando sua beleza com carinho e qualidade"
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      disabled={updateConfigMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {updateConfigMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Settings className="h-4 w-4" />
                      )}
                      Salvar Configurações
                    </Button>
                    
                    <Link href="/">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Ver na Home
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Upload de Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Logo do Site
              </CardTitle>
              <CardDescription>
                Faça upload da logo do seu site (máximo 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Logo atual */}
                {(config?.logoUrl || uploadedLogoUrl) && (
                  <div className="space-y-2">
                    <Label>Logo Atual</Label>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <img 
                        src={uploadedLogoUrl || config?.logoUrl || ""} 
                        alt="Logo atual"
                        className="w-16 h-16 object-contain"
                      />
                      <div>
                        <p className="text-sm font-medium">Logo personalizada</p>
                        <p className="text-xs text-muted-foreground">
                          Última atualização: {new Date(config?.updatedAt || "").toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload de nova logo */}
                <div className="space-y-2">
                  <Label>Fazer Upload de Nova Logo</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || uploadLogoMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      {isUploading || uploadLogoMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Escolher Arquivo
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      PNG, JPG, WebP até 5MB
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview das Configurações */}
          {config && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview das Configurações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4 mb-2">
                      {config.logoUrl && (
                        <img 
                          src={config.logoUrl} 
                          alt="Logo"
                          className="w-10 h-10 object-contain"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold" style={{ color: config.primaryColor }}>
                          {config.siteName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {config.siteSlogan}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      Nome: {config.siteName}
                    </Badge>
                    <Badge variant="secondary">
                      Cor: {config.primaryColor}
                    </Badge>
                    {config.logoUrl && (
                      <Badge variant="secondary">
                        Logo: Personalizada
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}