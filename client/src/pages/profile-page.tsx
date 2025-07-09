import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import { Calendar, Clock, User, Phone, Mail, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: userAppointments = [], isLoading: appointmentsLoading } = useQuery<UserAppointment[]>({
    queryKey: ["/api/appointments"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  // Filtrar apenas os agendamentos do usuário atual
  const myAppointments = userAppointments.filter(appointment => 
    appointment.email === user?.username
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
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
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
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
                      {myAppointments.map((appointment) => (
                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                              <h3 className="font-semibold text-gray-900">
                                Agendamento #{appointment.id}
                              </h3>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusText(appointment.status)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>{appointment.time}</span>
                              </div>
                            </div>
                            
                            {appointment.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-600">
                                  <strong>Observações:</strong> {appointment.notes}
                                </p>
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                              Criado em: {new Date(appointment.createdAt).toLocaleDateString('pt-BR')} às{' '}
                              {new Date(appointment.createdAt).toLocaleTimeString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Estatísticas Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{myAppointments.length}</div>
                    <div className="text-sm text-gray-600">Total de Agendamentos</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {myAppointments.filter(a => a.status === 'confirmed').length}
                    </div>
                    <div className="text-sm text-gray-600">Confirmados</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">
                      {myAppointments.filter(a => a.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Pendentes</div>
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