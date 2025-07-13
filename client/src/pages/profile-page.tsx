import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { Calendar, Clock, User, Phone, Mail, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileImageUpload } from "@/components/profile/profile-image-upload";
import { useEffect } from "react";
import { Redirect } from "wouter";

interface UserAppointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  serviceId: number;
  categoryId: number;
  date: string;
  time: string;
  notes?: string;
  status: string;
  createdAt: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  minPrice: number;
  maxPrice: number;
  categoryId: number;
  icon: string;
  featured: boolean;
  imageUrl?: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();

  // A ProtectedRoute já cuida da autenticação, então aqui só precisamos verificar se ainda está carregando
  if (authLoading) {
    return (
      <div className="font-sans bg-gray-100 text-gray-800 min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Se chegou até aqui, o usuário está autenticado (ProtectedRoute garante isso)

  const { data: myAppointments = [], isLoading: appointmentsLoading, error: appointmentsError } = useQuery<UserAppointment[]>({
    queryKey: ["/api/my-appointments"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services/all"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Função para encontrar dados do serviço
  const getServiceData = (serviceId: number) => {
    return services.find(s => s.id === serviceId);
  };

  // Função para encontrar dados da categoria
  const getCategoryData = (categoryId: number) => {
    return categories.find(c => c.id === categoryId);
  };

  // Função para formatar data corretamente sem problemas de timezone
  const formatDate = (dateString: string) => {
    // Adicionar 'T00:00:00' para forçar timezone local e evitar problemas de UTC
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Aguardando Confirmação';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Realizado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '📅';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '❌';
      case 'completed':
        return '✅';
      default:
        return '📋';
    }
  };

  return (
    <div className="font-sans bg-gray-100 text-gray-800 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header do Perfil */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="mx-auto sm:mx-0">
                    <ProfileImageUpload 
                      userId={user.id} 
                      currentImageUrl={user.profileImageBase64 ? `/api/images/user/${user.id}` : undefined}
                      size="lg"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 break-words">{user?.name || user?.username}</h1>
                    <div className="flex flex-col space-y-2 mt-3 text-gray-600">
                      <div className="flex items-center justify-center sm:justify-start space-x-2 min-w-0">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate text-sm sm:text-base">{user?.username}</span>
                      </div>
                      {user?.phone && (
                        <div className="flex items-center justify-center sm:justify-start space-x-2 min-w-0">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate text-sm sm:text-base">{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meus Agendamentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Meus Agendamentos</span>
                  </CardTitle>
                  <CardDescription>
                    Visualize e acompanhe o status dos seus agendamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {appointmentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Carregando agendamentos...</p>
                    </div>
                  ) : myAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
                      <p className="text-gray-600">Você ainda não possui agendamentos. Que tal agendar um serviço?</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myAppointments.map((appointment) => {
                        const serviceData = getServiceData(appointment.serviceId);
                        const categoryData = getCategoryData(appointment.categoryId);
                        
                        return (
                          <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    {serviceData && (
                                      <i className={`${serviceData.icon} text-blue-500`}></i>
                                    )}
                                    <h3 className="font-semibold text-gray-900">
                                      {serviceData?.name || `Serviço #${appointment.serviceId}`}
                                    </h3>
                                  </div>
                                  {categoryData && (
                                    <p className="text-sm text-gray-600 mb-1">
                                      <i className={`${categoryData.icon} mr-1`}></i>
                                      {categoryData.name}
                                    </p>
                                  )}
                                  {serviceData && serviceData.minPrice && (
                                    <p className="text-sm text-green-600 font-medium">
                                      A partir de R$ {serviceData.minPrice.toFixed(2).replace('.', ',')}
                                    </p>
                                  )}
                                </div>
                                <Badge className={`${getStatusColor(appointment.status)} border flex items-center space-x-1 flex-shrink-0`}>
                                  <span>{getStatusIcon(appointment.status)}</span>
                                  <span>{getStatusText(appointment.status)}</span>
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 flex-shrink-0" />
                                  <span>{formatDate(appointment.date)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 flex-shrink-0" />
                                  <span>{appointment.time}</span>
                                </div>
                              </div>
                              
                              {appointment.notes && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-md border-l-4 border-blue-200">
                                  <p className="text-sm text-gray-700">
                                    <strong className="text-blue-800">Observações:</strong> {appointment.notes}
                                  </p>
                                </div>
                              )}
                              
                              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                                Agendamento #{appointment.id} • Criado em: {new Date(appointment.createdAt).toLocaleDateString('pt-BR')} às{' '}
                                {new Date(appointment.createdAt).toLocaleTimeString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Estatísticas Rápidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{myAppointments.length}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-lg mb-2">✅</div>
                    <div className="text-xl font-bold text-green-600">
                      {myAppointments.filter(a => a.status === 'completed').length}
                    </div>
                    <div className="text-xs text-gray-600">Realizados</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-lg mb-2">📅</div>
                    <div className="text-xl font-bold text-blue-600">
                      {myAppointments.filter(a => a.status === 'confirmed').length}
                    </div>
                    <div className="text-xs text-gray-600">Confirmados</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-lg mb-2">⏳</div>
                    <div className="text-xl font-bold text-yellow-600">
                      {myAppointments.filter(a => a.status === 'pending').length}
                    </div>
                    <div className="text-xs text-gray-600">Pendentes</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}