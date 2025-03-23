import { z } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Category, ServiceOption } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";

const appointmentFormSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  categoryId: z.string().min(1, { message: "Selecione uma categoria" }),
  serviceId: z.string().min(1, { message: "Selecione um serviço" }),
  date: z.string().min(1, { message: "Selecione uma data" }),
  time: z.string().min(1, { message: "Selecione um horário" }),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export default function AppointmentForm() {
  const { toast } = useToast();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      categoryId: "",
      serviceId: "",
      date: "",
      time: "",
      notes: "",
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: services } = useQuery<ServiceOption[]>({
    queryKey: ['/api/services', selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      const response = await fetch(`/api/services/${selectedCategoryId}`);
      return response.json();
    },
    enabled: !!selectedCategoryId,
  });
  
  useEffect(() => {
    if (categories && selectedCategoryId) {
      const category = categories.find(cat => String(cat.id) === selectedCategoryId);
      if (category) {
        setSelectedCategoryName(category.name);
      }
    }
  }, [selectedCategoryId, categories]);
  
  useEffect(() => {
    const serviceId = form.getValues("serviceId");
    if (services && serviceId) {
      const service = services.find(serv => String(serv.id) === serviceId);
      if (service) {
        setSelectedService(service.name);
      }
    }
  }, [services, form]);

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      const response = await apiRequest("POST", "/api/appointments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Agendamento realizado!",
        description: "Em breve entraremos em contato para confirmar.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro ao agendar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: AppointmentFormValues) {
    createAppointmentMutation.mutate(data);
  }

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const numbersOnly = phone.replace(/\D/g, '');
    
    // Verifica se já tem o código do país (Brasil - 55)
    if (numbersOnly.startsWith('55')) {
      return numbersOnly;
    }
    
    // Adiciona o código do país (Brasil - 55)
    return `55${numbersOnly}`;
  };

  const handleWhatsAppScheduling = () => {
    // Valida o formulário antes de abrir o WhatsApp
    const formResult = form.trigger();
    
    formResult.then((isValid) => {
      if (!isValid) {
        toast({
          title: "Formulário incompleto",
          description: "Por favor, preencha todos os campos obrigatórios antes de agendar pelo WhatsApp.",
          variant: "destructive",
        });
        return;
      }
      
      // Pega os valores atuais do formulário
      const values = form.getValues();
      
      // Cria a mensagem para o WhatsApp
      let message = `Olá! Gostaria de agendar um horário para ${selectedService || "um serviço"} na categoria ${selectedCategoryName || "de beleza"}.\n\n`;
      message += `Nome: ${values.name}\n`;
      message += `Email: ${values.email}\n`;
      message += `Data: ${values.date}\n`;
      message += `Horário: ${values.time}\n`;
      
      if (values.notes) {
        message += `\nObservações: ${values.notes}`;
      }
      
      // Formata o número do WhatsApp (número do salão) - este seria o número comercial do salão
      const salonWhatsApp = "5500000000000"; // Substitua pelo número real do salão
      
      // Cria a URL do WhatsApp com a mensagem codificada
      const whatsappUrl = `https://wa.me/${salonWhatsApp}?text=${encodeURIComponent(message)}`;
      
      // Abre o WhatsApp em uma nova janela
      window.open(whatsappUrl, '_blank');
    });
  };

  const availableTimes = [
    "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-xl max-w-xl mx-auto border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Nome Completo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Seu nome completo" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="seu.email@exemplo.com" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Telefone (WhatsApp)</FormLabel>
                <FormControl>
                  <Input 
                    type="tel" 
                    placeholder="(00) 00000-0000" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <FormLabel className="text-gray-700 font-medium">Categoria de Serviço</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedCategoryId(value);
                    form.setValue("serviceId", "");
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Selecione uma categoria">
                        {categories?.find(cat => String(cat.id) === field.value)?.name}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
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
            name="serviceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Serviço Específico</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Atualiza o nome do serviço selecionado para uso no WhatsApp
                    if (services) {
                      const service = services.find(s => String(s.id) === value);
                      if (service) {
                        setSelectedService(service.name);
                      }
                    }
                  }}
                  value={field.value}
                  disabled={!selectedCategoryId}
                >
                  <FormControl>
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Selecione o serviço">
                        {services?.find(serv => String(serv.id) === field.value)?.name}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {services?.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
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
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Data</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Horário</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Selecione um horário">
                        {field.value}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Observações (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informações adicionais ou pedidos especiais" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="mt-8 space-y-6">
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            disabled={createAppointmentMutation.isPending}
          >
            {createAppointmentMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Agendando...</span>
              </div>
            ) : (
              "Confirmar Agendamento"
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                ou agende diretamente pelo
              </span>
            </div>
          </div>
          
          <Button
            type="button"
            onClick={handleWhatsAppScheduling}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl transition-colors duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
          >
            <MessageSquare className="h-5 w-5" />
            Agendar pelo WhatsApp
          </Button>
        </div>
      </form>
    </Form>
  );
}
