import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sale } from "@shared/schema";
import { Button } from "@/components/ui/button";

type FilterPeriod = "day" | "week" | "month" | "all";

export default function SalesHistory() {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("all");

  const { data: sales, isLoading } = useQuery<Sale[]>({
    queryKey: ['/api/sales', filterPeriod],
  });

  const getFilteredSales = () => {
    if (!sales) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filterPeriod) {
      case "day":
        return sales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= today;
        });
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return sales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= weekStart;
        });
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return sales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= monthStart;
        });
      default:
        return sales;
    }
  };

  const filteredSales = getFilteredSales();
  
  const calculateTotal = (sales: Sale[]) => {
    return sales.reduce((total, sale) => total + sale.amount, 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "cash": return "Dinheiro";
      case "credit": return "Cartão de Crédito";
      case "debit": return "Cartão de Débito";
      case "pix": return "PIX";
      default: return method;
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md h-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center mb-3">
          <i className="fas fa-history mr-3 text-blue-500"></i> Histórico de Vendas
        </h3>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <Button
            variant={filterPeriod === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPeriod("day")}
            className={`${filterPeriod === "day" ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-700"} text-xs sm:text-sm px-2 sm:px-3`}
          >
            Hoje
          </Button>
          <Button
            variant={filterPeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPeriod("week")}
            className={`${filterPeriod === "week" ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-700"} text-xs sm:text-sm px-2 sm:px-3`}
          >
            Semana
          </Button>
          <Button
            variant={filterPeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPeriod("month")}
            className={`${filterPeriod === "month" ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-700"} text-xs sm:text-sm px-2 sm:px-3`}
          >
            Mês
          </Button>
          <Button
            variant={filterPeriod === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPeriod("all")}
            className={`${filterPeriod === "all" ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-700"} text-xs sm:text-sm px-2 sm:px-3`}
          >
            Todos
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-4 text-gray-500">Nenhuma venda encontrada no período selecionado.</div>
        ) : (
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-gray-700 font-medium">Data</th>
                <th className="py-3 px-4 text-left text-gray-700 font-medium">Cliente</th>
                <th className="py-3 px-4 text-left text-gray-700 font-medium">Serviço</th>
                <th className="py-3 px-4 text-left text-gray-700 font-medium">Valor</th>
                <th className="py-3 px-4 text-left text-gray-700 font-medium">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">{formatDate(sale.date)}</td>
                  <td className="py-3 px-4 text-gray-700">{sale.clientName}</td>
                  <td className="py-3 px-4 text-gray-700">{sale.serviceName}</td>
                  <td className="py-3 px-4 text-gray-700">R${sale.amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-700">{getPaymentMethodName(sale.paymentMethod)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-gray-700 mb-1">Total {filterPeriod === "day" ? "de Hoje" : filterPeriod === "week" ? "da Semana" : filterPeriod === "month" ? "do Mês" : ""}</h4>
          <p className="text-2xl font-bold text-gray-800">
            R${calculateTotal(filteredSales).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-gray-700 mb-1">Vendas</h4>
          <p className="text-2xl font-bold text-gray-800">{filteredSales.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-gray-700 mb-1">Média por Venda</h4>
          <p className="text-2xl font-bold text-gray-800">
            R${filteredSales.length ? (calculateTotal(filteredSales) / filteredSales.length).toFixed(2) : "0.00"}
          </p>
        </div>
      </div>
    </div>
  );
}
