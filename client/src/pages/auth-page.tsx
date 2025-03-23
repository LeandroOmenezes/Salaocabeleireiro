import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { useAuth } from "@/lib/auth";

export default function AuthPage() {
  const [showRegister, setShowRegister] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if user is already logged in
  if (user) {
    navigate("/");
    return null;
  }

  return (
    <div className="font-sans bg-gray-100 text-gray-800 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section id="login" className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Área do Cliente</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">Acesse sua conta para gerenciar agendamentos e ver seu histórico de serviços.</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className={`${showRegister ? 'hidden' : 'block'}`}>
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <LoginForm onToggleForm={() => setShowRegister(true)} />
                </div>
              </div>
              
              <div className={`${showRegister ? 'block' : 'hidden'}`}>
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <RegisterForm onToggleForm={() => setShowRegister(false)} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
