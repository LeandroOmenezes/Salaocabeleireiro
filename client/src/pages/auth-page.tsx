import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoginBackground {
  id: number;
  backgroundImage: string | null;
  isActive: boolean;
}

export default function AuthPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch login background configuration
  const { data: loginBackground } = useQuery<LoginBackground>({
    queryKey: ["/api/login-background"],
  });
  
  // Verificar parâmetros de URL para mensagens de erro
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    
    if (error) {
      let errorMsg = decodeURIComponent(error);
      
      // Personalizar mensagem para erro específico do Google OAuth
      if (error.includes('google') || error.includes('redirect_uri')) {
        errorMsg = "Problema com autenticação Google. Clique aqui para ver como resolver.";
      }
      
      setErrorMessage(errorMsg);
      // Limpar URL para não mostrar erro após refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const backgroundStyle = loginBackground?.backgroundImage 
    ? {
        backgroundImage: `url(${loginBackground.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {};

  return (
    <div className="font-sans bg-gray-100 text-gray-800 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section 
          id="login" 
          className="py-16 relative"
          style={backgroundStyle}
        >
          {/* Overlay quando há imagem de fundo */}
          {loginBackground?.backgroundImage && (
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          )}
          
          <div className="relative z-10">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className={`text-3xl font-bold mb-4 ${
                  loginBackground?.backgroundImage 
                    ? "text-white drop-shadow-lg" 
                    : "text-gray-800"
                }`}>
                  Área do Cliente
                </h2>
                <p className={`max-w-2xl mx-auto ${
                  loginBackground?.backgroundImage 
                    ? "text-white drop-shadow-md" 
                    : "text-gray-700"
                }`}>
                  Acesse sua conta para gerenciar agendamentos e ver seu histórico de serviços.
                </p>
              </div>
            
              <div className="max-w-md mx-auto">
                {errorMessage && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>
                      {errorMessage}
                      {errorMessage.includes('Google') && (
                        <div className="mt-2">
                          <button
                            onClick={() => navigate('/oauth-diagnostics')}
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                          >
                            Ver instruções para corrigir Google OAuth
                          </button>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className={`${showRegister ? 'hidden' : 'block'}`}>
                  <div className={`p-8 rounded-lg ${
                    loginBackground?.backgroundImage 
                      ? "bg-white bg-opacity-95 backdrop-blur-sm shadow-2xl" 
                      : "bg-white shadow-md"
                  }`}>
                    <LoginForm onToggleForm={() => setShowRegister(true)} />
                  </div>
                </div>
                
                <div className={`${showRegister ? 'block' : 'hidden'}`}>
                  <div className={`p-8 rounded-lg ${
                    loginBackground?.backgroundImage 
                      ? "bg-white bg-opacity-95 backdrop-blur-sm shadow-2xl" 
                      : "bg-white shadow-md"
                  }`}>
                    <RegisterForm onToggleForm={() => setShowRegister(false)} />
                  </div>
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
