
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Appointment, Service } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AppointmentsManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ['/api/services/all'],
  });

  const getFilteredAppointments = () => {
    if (!appointments) return [];
    if (statusFilter === "all") return appointments;
    return appointments.filter(appointment => appointment.status === statusFilter);
  };

  const filteredAppointments = getFilteredAppointments();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getServiceName = (serviceId: string) => {
    if (!services) return "Carregando...";
    const service = services.find(s => String(s.id) === serviceId);
    return service ? service.name : "Serviço não encontrado";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Agendamentos</h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="confirmed">Confirmados</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Carregando agendamentos...</p>
          </div>
        ) : !appointments || appointments.length === 0 ? (
          <div className="p-10 text-center border rounded-lg">
            <p className="text-xl text-gray-500 mb-2">Nenhum agendamento encontrado</p>
            <p className="text-gray-400">Quando os clientes fizerem agendamentos, eles aparecerão aqui.</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left">Cliente</th>
                <th className="py-3 px-4 text-left">Serviço</th>
                <th className="py-3 px-4 text-left">Data</th>
                <th className="py-3 px-4 text-left">Horário</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-t">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{appointment.name}</div>
                      <div className="text-sm text-gray-500">{appointment.phone}</div>
                      <div className="text-sm text-gray-500">{appointment.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{getServiceName(appointment.serviceId)}</td>
                  <td className="py-3 px-4">{formatDate(appointment.date)}</td>
                  <td className="py-3 px-4">{appointment.time}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appointment.status === 'pending' ? 'Pendente' :
                       appointment.status === 'confirmed' ? 'Confirmado' :
                       appointment.status === 'completed' ? 'Concluído' :
                       'Cancelado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
