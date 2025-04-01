import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useState, FormEvent } from "react";
import { FaGoogle } from "react-icons/fa";
import { Loader2 } from "lucide-react";

const loginFormSchema = z.object({
  username: z.string().min(1, { message: "Email é obrigatório" }).email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  onToggleForm: () => void;
}

export default function LoginForm({ onToggleForm }: LoginFormProps) {
  const { loginMutation, forgotPasswordMutation } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(data: LoginFormValues) {
    loginMutation.mutate({
      username: data.username,
      password: data.password
    });
  }
  
  function handleForgotPassword(e: FormEvent) {
    e.preventDefault();
    forgotPasswordMutation.mutate({ email: forgotPasswordEmail });
    setShowForgotPassword(false);
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-gray-700 font-medium mb-2">Email</FormLabel>
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-gray-700 font-medium mb-2">Senha</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-between items-center">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-gray-700 cursor-pointer">Lembrar-me</FormLabel>
                </FormItem>
              )}
            />
            <button 
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-500 hover:text-blue-700"
            >
              Esqueci minha senha
            </button>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-200 font-medium"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </Button>
          
          {/* Botão de login rápido para testes */}
          <Button
            type="button"
            className="w-full bg-green-500 text-white px-6 py-3 mt-3 rounded-full hover:bg-green-600 transition-colors duration-200 font-medium"
            onClick={() => {
              form.setValue("username", "lleandro.m32@gmail.com");
              form.setValue("password", "admin");
              loginMutation.mutate({
                username: "lleandro.m32@gmail.com",
                password: "admin"
              });
            }}
            disabled={loginMutation.isPending}
          >
            Entrar como administrador (teste)
          </Button>
        </form>
      </Form>
      
      <div className="relative flex items-center justify-center">
        <hr className="w-full border-t border-gray-200"/>
        <span className="absolute bg-white px-3 text-gray-600 text-sm">ou</span>
      </div>
      
      {/* Botão de login com Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors duration-200 font-medium flex justify-center items-center"
        onClick={() => {
          setIsGoogleLoading(true);
          console.log("Redirecionando para autenticação do Google...");
          
          // Redirecionar para a rota de autenticação do Google
          window.location.href = "/api/auth/google";
        }}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Redirecionando...
          </>
        ) : (
          <>
            <FaGoogle className="mr-2 text-red-500" /> 
            Entrar com Google
          </>
        )}
      </Button>
      
      <p className="text-gray-500 text-xs text-center mt-4">
        Para o login com Google funcionar, é necessário configurar as credenciais no Console do Google Cloud 
        e adicionar o URL de callback como domínio autorizado.
      </p>
      
      {/* Modal de recuperação de senha */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Recuperar Senha</h3>
            <p className="text-gray-600 mb-4">Digite seu email para receber um link de recuperação de senha.</p>
            
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <Input 
                  type="email" 
                  placeholder="seu.email@exemplo.com" 
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? "Enviando..." : "Enviar Link"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="text-center mt-4">
        <p className="text-gray-700">
          Ainda não tem uma conta? 
          <button
            type="button"
            onClick={onToggleForm}
            className="text-blue-500 hover:text-blue-700 font-medium ml-1"
          >
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  );
}
