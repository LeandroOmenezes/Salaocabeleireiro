import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ServiceOption } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const salesFormSchema = z.object({
  clientName: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  serviceId: z.string().min(1, { message: "Selecione um serviço" }),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Valor deve ser maior que zero",
  }),
  date: z.string().min(1, { message: "Selecione uma data" }),
  paymentMethod: z.string().min(1, { message: "Selecione um método de pagamento" }),
});

type SalesFormValues = z.infer<typeof salesFormSchema>;

const PAYMENT_METHODS = [
  { id: "cash", name: "Dinheiro" },
  { id: "credit", name: "Cartão de Crédito" },
  { id: "debit", name: "Cartão de Débito" },
  { id: "pix", name: "PIX" },
];

export default function SalesForm() {
  const { toast } = useToast();
  const [selectedServiceName, setSelectedServiceName] = useState<string | null>(null);
  const [selectedPaymentName, setSelectedPaymentName] = useState<string | null>(null);
  
  const form = useForm<SalesFormValues>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: {
      clientName: "",
      serviceId: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "",
    },
  });

  const { data: services } = useQuery<ServiceOption[]>({
    queryKey: ['/api/services/all'],
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: SalesFormValues) => {
      const response = await apiRequest("POST", "/api/sales", {
        ...data,
        amount: parseFloat(data.amount),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Venda registrada!",
        description: "A venda foi registrada com sucesso.",
      });
      form.reset({
        clientName: "",
        serviceId: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: "",
      });
      setSelectedServiceName(null);
      setSelectedPaymentName(null);
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar venda",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  // Update amount when service changes
  const watchedServiceId = form.watch("serviceId");
  
  useEffect(() => {
    if (watchedServiceId && services) {
      const selectedService = services.find(service => service.id === watchedServiceId);
      if (selectedService) {
        form.setValue("amount", selectedService.minPrice.toString());
        setSelectedServiceName(selectedService.name);
      }
    }
  }, [watchedServiceId, services, form]);

  function onSubmit(data: SalesFormValues) {
    createSaleMutation.mutate(data);
  }

  const handleServiceChange = (value: string) => {
    form.setValue("serviceId", value);
    if (services) {
      const service = services.find(s => s.id === value);
      if (service) {
        setSelectedServiceName(service.name);
      }
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    form.setValue("paymentMethod", value);
    const method = PAYMENT_METHODS.find(m => m.id === value);
    if (method) {
      setSelectedPaymentName(method.name);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-gray-700 font-medium mb-2">Cliente</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome do cliente" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-gray-700 font-medium mb-2">Serviço</FormLabel>
              <Select 
                onValueChange={handleServiceChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Selecionar serviço">
                      {selectedServiceName}
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-gray-700 font-medium mb-2">Valor (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0,00" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-gray-700 font-medium mb-2">Data</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-gray-700 font-medium mb-2">Forma de Pagamento</FormLabel>
              <Select 
                onValueChange={handlePaymentMethodChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Selecionar método">
                      {selectedPaymentName}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
          disabled={createSaleMutation.isPending}
        >
          {createSaleMutation.isPending ? "Registrando..." : "Registrar Venda"}
        </Button>
      </form>
    </Form>
  );
}
