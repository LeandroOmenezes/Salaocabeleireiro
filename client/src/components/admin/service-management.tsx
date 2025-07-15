import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Service, Category, insertServiceSchema, type InsertService } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, Eye, ExternalLink, Plus, Trash2, Save, X, Star, Wrench, Edit } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";

export default function ServiceManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/services/all'],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    refetchOnWindowFocus: true,
  });

  const form = useForm<InsertService>({
    resolver: zodResolver(insertServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      minPrice: 0,
      maxPrice: 0,
      categoryId: 1,
      icon: "fas fa-spa",
      featured: false,
    },
  });

  const editForm = useForm<InsertService>({
    resolver: zodResolver(insertServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      minPrice: 0,
      maxPrice: 0,
      categoryId: 1,
      icon: "fas fa-spa",
      featured: false,
    },
  });

  const addServiceMutation = useMutation({
    mutationFn: async (data: InsertService) => {
      const response = await apiRequest('POST', '/api/admin/services', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Serviço adicionado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services/featured'] });
      setShowAddForm(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/services/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Serviço removido com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services/featured'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/services/${id}/featured`, { featured });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Status de destaque atualizado",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services/featured'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao alterar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const editServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertService }) => {
      const response = await apiRequest('PUT', `/api/admin/services/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Serviço atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services/all'] });
      setEditingService(null);
      editForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar serviço",
        variant: "destructive",
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ serviceId, file }: { serviceId: number; file: File }) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`/api/services/${serviceId}/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer upload da imagem');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Imagem enviada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services/all'] });
      setUploadingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
      setUploadingId(null);
    },
  });

  const handleImageUpload = (serviceId: number, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Apenas arquivos JPEG, PNG e WebP são permitidos",
        variant: "destructive",
      });
      return;
    }

    setUploadingId(serviceId);
    uploadImageMutation.mutate({ serviceId, file });
  };

  const onAddSubmit = (data: InsertService) => {
    addServiceMutation.mutate(data);
  };

  const handleDeleteService = (id: number) => {
    if (confirm("Tem certeza que deseja remover este serviço? Esta ação não pode ser desfeita.")) {
      deleteServiceMutation.mutate(id);
    }
  }

  const handleToggleFeatured = (serviceId: number, currentFeatured: boolean) => {
    toggleFeaturedMutation.mutate({ id: serviceId, featured: !currentFeatured });
  };

  const handleEditService = (service: Service) => {
    console.log('handleEditService called with service:', service);
    setEditingService(service);
    editForm.reset({
      name: service.name,
      description: service.description,
      minPrice: service.minPrice,
      maxPrice: service.maxPrice,
      categoryId: service.categoryId,
      icon: service.icon,
      featured: service.featured || false,
    });
    console.log('editingService state set to:', service);
  };

  const onEditSubmit = (data: InsertService) => {
    if (editingService) {
      editServiceMutation.mutate({ id: editingService.id, data });
    }
  };;

  const getCategoryName = (categoryId: number) => {
    return categories?.find(cat => cat.id === categoryId)?.name || "Categoria não encontrada";
  };

  const formatPrice = (min: number, max: number) => {
    return min === max ? `R$${min.toFixed(2)}` : `R$${min.toFixed(2)} - R$${max.toFixed(2)}`;
  };

  if (servicesLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando serviços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerenciamento de Serviços</h2>
            <p className="text-gray-600">
              Gerencie os serviços oferecidos pelo salão. Adicione novos serviços, faça upload de imagens personalizadas e remova serviços que não são mais oferecidos.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Eye className="w-4 h-4" />
              <span>Ver na Home</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Serviço
            </Button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Adicionar Novo Serviço
            </CardTitle>
            <CardDescription>
              Preencha os dados do novo serviço oferecido pelo salão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Serviço</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Corte de Cabelo Feminino" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Mínimo (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="50.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Máximo (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="80.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone (FontAwesome)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="fas fa-cut"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Serviço em Destaque
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva o serviço oferecido..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={addServiceMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {addServiceMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service) => (
          <Card key={service.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <i className={`${service.icon} text-2xl text-blue-500`}></i>
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {getCategoryName(service.categoryId)}
                    </CardDescription>
                  </div>
                </div>
                {service.featured && (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {service.description}
                </p>
                
                <div className="text-lg font-semibold text-green-600">
                  {formatPrice(service.minPrice, service.maxPrice)}
                </div>

                {/* Service Image */}
                <div className="space-y-3">
                  {service.imageUrl ? (
                    <div className="relative">
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
                        <span className="text-white text-sm">Clique para alterar</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Sem imagem</p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(service.id, file);
                      }
                    }}
                    className="hidden"
                    id={`upload-${service.id}`}
                  />
                  
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById(`upload-${service.id}`)?.click()}
                        disabled={uploadingId === service.id}
                        className="col-span-2"
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        {uploadingId === service.id ? "Enviando..." : "Upload"}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                        disabled={deleteServiceMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditService(service)}
                        className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                    
                    <Button
                      variant={service.featured ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleFeatured(service.id, service.featured || false)}
                      disabled={toggleFeaturedMutation.isPending}
                      className={`w-full ${service.featured 
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                        : "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                      }`}
                    >
                      <Star className={`w-4 h-4 mr-1 ${service.featured ? "fill-current" : ""}`} />
                      {service.featured ? "Em Destaque" : "Marcar Destaque"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!services || services.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum serviço encontrado.</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Serviço
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingService && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Editar Serviço: {editingService.name}
            </CardTitle>
            <CardDescription>
              Atualize as informações do serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Serviço</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Mínimo (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Máximo (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone (FontAwesome)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: fas fa-cut" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Serviço em Destaque</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva os detalhes do serviço oferecido"
                          className="min-h-[100px]"
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
                    disabled={editServiceMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editServiceMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setEditingService(null)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}