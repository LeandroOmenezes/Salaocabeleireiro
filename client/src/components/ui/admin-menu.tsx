import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Settings, 
  Users, 
  BarChart3, 
  Upload, 
  Menu,
  X,
  ChevronRight,
  Layout,
  FileText,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const menuItems = [
    {
      href: "/dashboard",
      icon: BarChart3,
      label: "Dashboard",
      description: "Visão geral e relatórios"
    },
    {
      href: "/clients-sales",
      icon: Users,
      label: "Clientes & Vendas",
      description: "Gestão de clientes e vendas"
    },
    {
      href: "/admin/services",
      icon: Upload,
      label: "Gerenciar Imagens",
      description: "Upload de fotos dos serviços"
    },
    {
      href: "/admin/banner",
      icon: Layout,
      label: "Banner Principal",
      description: "Personalizar página inicial"
    },
    {
      href: "/admin/footer",
      icon: FileText,
      label: "Rodapé",
      description: "Configurar informações de contato"
    },
    {
      href: "/admin/prices",
      icon: DollarSign,
      label: "Tabela de Preços",
      description: "Gerenciar preços dos serviços"
    }
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      {/* Menu Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleMenu}
        className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        <span className="hidden sm:inline">Admin</span>
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Painel Admin</h2>
              <p className="text-blue-100 text-sm">Ferramentas de administração</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  block p-4 rounded-lg border transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'hover:bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${
                    isActive ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
          <div className="text-center text-sm text-gray-500">
            <Settings className="w-4 h-4 inline mr-1" />
            Painel de Administração
          </div>
        </div>
      </div>
    </div>
  );
}