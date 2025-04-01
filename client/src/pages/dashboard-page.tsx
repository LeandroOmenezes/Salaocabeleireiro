import { useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import SalesForm from "@/components/sales/sales-form";
import SalesHistory from "@/components/sales/sales-history";
import AppointmentsManagement from "@/components/appointments/appointments-management";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="font-sans bg-gray-100 text-gray-800 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section id="sales-management" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Painel Administrativo</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">Gerencie agendamentos, registre vendas e acompanhe o desempenho do seu negócio.</p>
            </div>
            
            <div className="mb-16">
              <div className="text-left mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Agendamentos</h2>
                <p className="text-gray-700">Visualize todos os agendamentos realizados pelos clientes.</p>
              </div>
              <AppointmentsManagement />
            </div>
            
            <div className="text-left mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestão de Vendas</h2>
              <p className="text-gray-700">Registre vendas e acompanhe o desempenho financeiro.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Register Sale Form */}
              <div className="lg:col-span-1">
                <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <i className="fas fa-cash-register mr-3 text-blue-500"></i> Registrar Venda
                  </h3>
                  
                  <SalesForm />
                </div>
              </div>
              
              {/* Sales History */}
              <div className="lg:col-span-2">
                <SalesHistory />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
