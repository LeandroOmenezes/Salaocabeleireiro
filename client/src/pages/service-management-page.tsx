import { useQuery } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import ServiceImageUpload from "@/components/admin/service-image-upload";
import { AdminProtectedRoute } from "@/lib/protected-route";
import { Loader2, Settings, Eye, ExternalLink } from "lucide-react";

function ServiceManagementContent() {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services/all'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Imagens dos Serviços</h1>
          </div>
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
        </div>
        <p className="text-gray-600 max-w-2xl">
          Faça upload de imagens personalizadas para cada serviço do salão. As imagens devem mostrar 
          o ambiente real do salão ou exemplos dos serviços prestados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service) => (
          <ServiceImageUpload key={service.id} service={service} />
        ))}
      </div>

      {(!services || services.length === 0) && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum serviço encontrado.</p>
        </div>
      )}
    </div>
  );
}

export default function ServiceManagementPage() {
  return (
    <AdminProtectedRoute 
      path="/admin/services" 
      component={ServiceManagementContent} 
    />
  );
}