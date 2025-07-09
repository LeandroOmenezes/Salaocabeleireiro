import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <i className="fas fa-cut text-blue-500 text-xl"></i>
          <span className="text-2xl font-bold text-gray-800">Salão de Beleza</span>
        </Link>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            className="text-gray-800 focus:outline-none" 
            aria-label="Menu"
            onClick={toggleMobileMenu}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#services" className="text-gray-700 hover:text-blue-500 transition-colors duration-200">Serviços</a>
          <a href="#prices" className="text-gray-700 hover:text-blue-500 transition-colors duration-200">Preços</a>
          <a href="#appointments" className="text-gray-700 hover:text-blue-500 transition-colors duration-200">Agendamentos</a>
          <a href="#reviews" className="text-gray-700 hover:text-blue-500 transition-colors duration-200">Avaliações</a>
          {user && user.isAdmin && (
            <Link 
              href="/clients-sales" 
              className={`text-gray-700 hover:text-blue-500 transition-colors duration-200 ${location === "/clients-sales" ? "text-blue-500 font-medium" : ""}`}
            >
              Gestão de Clientes/Vendas
            </Link>
          )}
          
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-100 px-3 py-2 rounded-full">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-sm"></i>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-800">{user.name || user.username}</div>
                  {user.isAdmin && (
                    <div className="text-xs text-blue-600 font-medium">Administrador</div>
                  )}
                </div>
              </div>
              <Link 
                href="/profile" 
                className={`text-gray-700 hover:text-blue-500 transition-colors duration-200 ${location === "/profile" ? "text-blue-500 font-medium" : ""}`}
              >
                Meu Perfil
              </Link>
              {user.isAdmin && (
                <Link 
                  href="/dashboard" 
                  className={`text-gray-700 hover:text-blue-500 transition-colors duration-200 ${location === "/dashboard" ? "text-blue-500 font-medium" : ""}`}
                >
                  Dashboard
                </Link>
              )}
              <button 
                onClick={() => logoutMutation.mutate()}
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Saindo..." : "Sair"}
              </button>
            </div>
          ) : (
            <Link 
              href="/auth" 
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
      
      {/* Mobile menu */}
      <div className={`bg-white md:hidden ${mobileMenuOpen ? "" : "hidden"}`}>
        <div className="container mx-auto px-4 py-3 space-y-3">
          <a href="#services" className="block text-gray-700 py-2 hover:text-blue-500" onClick={() => setMobileMenuOpen(false)}>Serviços</a>
          <a href="#prices" className="block text-gray-700 py-2 hover:text-blue-500" onClick={() => setMobileMenuOpen(false)}>Preços</a>
          <a href="#appointments" className="block text-gray-700 py-2 hover:text-blue-500" onClick={() => setMobileMenuOpen(false)}>Agendamentos</a>
          <a href="#reviews" className="block text-gray-700 py-2 hover:text-blue-500" onClick={() => setMobileMenuOpen(false)}>Avaliações</a>
          {user && user.isAdmin && (
            <Link 
              href="/clients-sales" 
              className="block text-gray-700 py-2 hover:text-blue-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gestão de Clientes/Vendas
            </Link>
          )}
          
          {user ? (
            <>
              <div className="flex items-center space-x-3 bg-gray-100 px-3 py-2 rounded-lg mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-sm"></i>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-800">{user.name || user.username}</div>
                  {user.isAdmin && (
                    <div className="text-xs text-blue-600 font-medium">Administrador</div>
                  )}
                </div>
              </div>
              <Link 
                href="/profile" 
                className="block text-gray-700 py-2 hover:text-blue-500" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Meu Perfil
              </Link>
              {user.isAdmin && (
                <Link 
                  href="/dashboard" 
                  className="block text-gray-700 py-2 hover:text-blue-500" 
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <button 
                onClick={() => {
                  logoutMutation.mutate();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left text-gray-700 py-2 hover:text-blue-500"
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Saindo..." : "Sair"}
              </button>
            </>
          ) : (
            <Link 
              href="/auth" 
              className="block text-gray-700 py-2 hover:text-blue-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
