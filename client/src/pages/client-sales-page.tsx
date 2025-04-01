import { useEffect } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import SalesForm from "@/components/sales/sales-form";
import SalesHistory from "@/components/sales/sales-history";
import ClientList from "@/components/clients/client-list";
import { useAuth } from "@/hooks/use-auth";
import { Users, ShoppingBag, BarChart2 } from "lucide-react";

export default function ClientSalesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if user is not logged in or not admin
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else if (!user.isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="font-sans bg-gray-100 text-gray-800 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Gestão de Clientes e Vendas</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Gerencie seus clientes, registre vendas e acompanhe o desempenho do seu negócio com eficiência.
              </p>
            </div>

            <Tabs defaultValue="clients" className="max-w-5xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="clients" className="flex items-center gap-2">
                  <Users size={18} />
                  <span>Clientes</span>
                </TabsTrigger>
                <TabsTrigger value="sales" className="flex items-center gap-2">
                  <ShoppingBag size={18} />
                  <span>Vendas</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="clients">
                <div className="mb-8">
                  <ClientList />
                </div>
              </TabsContent>
              
              <TabsContent value="sales">
                <div className="mb-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Register Sale Form */}
                    <div className="lg:col-span-1">
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                          <ShoppingBag className="mr-2 h-5 w-5 text-blue-500" />
                          Registrar Venda
                        </h3>
                        
                        <SalesForm />
                      </div>
                    </div>
                    
                    {/* Sales History */}
                    <div className="lg:col-span-2">
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                          <BarChart2 className="mr-2 h-5 w-5 text-blue-500" />
                          Histórico de Vendas
                        </h3>
                        
                        <SalesHistory />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}