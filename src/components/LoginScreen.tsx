import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, User, Lock, Mail, UserPlus, Apple, ArrowLeft } from "lucide-react";

export const LoginScreen: React.FC = () => {
  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Função para traduzir mensagens de erro do Supabase
  const translateError = (errorMessage: string): string => {
    // Mapeamento de mensagens de erro do Supabase para mensagens amigáveis em português
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Credenciais inválidas. Verifique seu email e senha.',
      'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
      'User not found': 'Usuário não encontrado.',
      'Invalid email or password': 'Email ou senha inválidos.',
      'Email already in use': 'Este email já está sendo usado.',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
      'Profile not found': 'Perfil não encontrado. Entre em contato com o administrador.',
      'Login failed': 'Falha no login. Tente novamente mais tarde.',
      'Too many requests': 'Muitas tentativas de login. Tente novamente mais tarde.',
      'Server error': 'Erro no servidor. Tente novamente mais tarde.',
    };

    // Verifica se a mensagem de erro está no mapeamento
    if (errorMessage in errorMap) {
      return errorMap[errorMessage];
    }

    // Verifica se a mensagem contém alguma das chaves do mapeamento
    for (const key in errorMap) {
      if (errorMessage.includes(key)) {
        return errorMap[key];
      }
    }

    // Retorna uma mensagem genérica se não encontrar uma tradução específica
    return 'Erro ao fazer login. Verifique suas credenciais e tente novamente.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Aguardar um tempo para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 800));

      // Chamar a função de login de forma assíncrona
      const result = await login(email, password);

      if (result.success) {
        // Login bem-sucedido, redirecionar para a última página visitada ou para o dashboard
        const lastVisitedPage = localStorage.getItem('lastVisitedPage') || '/';
        navigate(lastVisitedPage);
      } else {
        // Traduzir a mensagem de erro para uma mensagem amigável
        const errorMessage = result.error ? translateError(result.error) : "Credenciais inválidas. Tente novamente.";

        // Garantir que a mensagem de erro seja exibida e persistida
        setError(errorMessage);

        // Forçar uma atualização do estado após um pequeno atraso para garantir que a mensagem seja exibida
        setTimeout(() => {
          setError(prevError => prevError || errorMessage);
        }, 100);
      }
    } catch (error: any) {
      const errorMessage = error?.message ? translateError(error.message) : "Ocorreu um erro durante o login. Tente novamente mais tarde.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Validar senha
      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        setIsLoading(false);
        return;
      }

      // Validar nome
      if (name.trim().length < 2) {
        setError("Por favor, insira um nome válido.");
        setIsLoading(false);
        return;
      }

      // Aguardar um tempo para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 800));

      // Chamar a função de registro
      const result = await register(email, password, name);

      if (result.success) {
        if (result.error) {
          // Caso de sucesso com mensagem (ex: verificação de email)
          setSuccess(result.error);
        } else {
          // Registro e login automático bem-sucedidos
          setSuccess("Registro concluído com sucesso!");
        }
      } else {
        // Traduzir a mensagem de erro para uma mensagem amigável
        const errorMessage = result.error ? translateError(result.error) : "Falha no registro. Tente novamente.";
        setError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.message ? translateError(error.message) : "Ocorreu um erro durante o registro. Tente novamente mais tarde.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!email) {
        setError("Por favor, insira seu email.");
        setIsLoading(false);
        return;
      }

      // Aguardar um tempo para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 800));

      // Chamar a função de recuperação de senha
      const result = await resetPassword(email);

      if (result.success) {
        setSuccess("Instruções de recuperação de senha foram enviadas para seu email.");
      } else {
        const errorMessage = result.error ? translateError(result.error) : "Falha na recuperação de senha. Tente novamente.";
        setError(errorMessage);
      }
    } catch (error: any) {
      console.error("Exceção durante a recuperação de senha:", error);
      const errorMessage = error?.message ? translateError(error.message) : "Ocorreu um erro durante a recuperação de senha. Tente novamente mais tarde.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithGoogle = () => {
    // Implementação futura
    setError("Login com Google será implementado em breve.");
  };

  const handleLoginWithApple = () => {
    // Implementação futura
    setError("Login com Apple será implementado em breve.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full relative overflow-hidden p-3 sm:p-4 md:p-6">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/image/image-login.jpg')`,
        }}
      >
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Container principal */}
      <div className="liquid-glass-card crystal-shimmer w-full max-w-sm sm:max-w-md z-10 relative p-4 sm:p-6 md:p-8">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center">
              <img
                src="/Bitcoin.svg"
                alt="Bitcoin Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-neon-blue-400 to-white bg-clip-text text-transparent">
                CryptoGlass
              </h1>
              <p className="text-xs text-gray-400">Professional Trading</p>
            </div>
          </div>
          <p className="text-white text-sm sm:text-base md:text-lg mt-1 mb-4 sm:mb-6 text-center">
            {isForgotPassword
              ? "Recuperar senha"
              : isRegisterMode
                ? "Crie sua conta"
                : "Entre para acessar sua conta"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-xs sm:text-sm">
            {success}
          </div>
        )}

        {isForgotPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full liquid-glass-login rounded-lg py-2.5 sm:py-3 pl-8 sm:pl-10 pr-3 text-white placeholder-gray-400 text-sm sm:text-base outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-neon-blue-400 to-neon-blue-600 rounded-lg py-2.5 sm:py-3 text-white font-medium flex items-center justify-center text-sm sm:text-base transition-all ${isLoading ? "opacity-80" : "hover:brightness-110"}`}
            >
              {isLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              )}
              {isLoading ? "Enviando..." : "Enviar instruções"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError("");
                  setSuccess("");
                }}
                className="text-neon-blue-400 hover:text-neon-blue-300 text-sm flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Voltar para o login
              </button>
            </div>
          </form>
        ) : isRegisterMode ? (
          <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                  <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full liquid-glass-login rounded-lg py-2.5 sm:py-3 pl-8 sm:pl-10 pr-3 text-white placeholder-gray-400 text-sm sm:text-base outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full liquid-glass-login rounded-lg py-2.5 sm:py-3 pl-8 sm:pl-10 pr-3 text-white placeholder-gray-400 text-sm sm:text-base outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full liquid-glass-login rounded-lg py-2.5 sm:py-3 pl-8 sm:pl-10 pr-8 sm:pr-10 text-white placeholder-gray-400 text-sm sm:text-base outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg py-2.5 sm:py-3 text-white font-medium flex items-center justify-center text-sm sm:text-base transition-all ${isLoading ? "opacity-80" : "hover:brightness-110"}`}
            >
              {isLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              )}
              {isLoading ? "Registrando..." : "Registrar"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setError("");
                  setSuccess("");
                }}
                className="text-neon-blue-400 hover:text-neon-blue-300 text-sm"
              >
                Já tem uma conta? Entrar
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full liquid-glass-login rounded-lg py-2.5 sm:py-3 pl-8 sm:pl-10 pr-3 text-white placeholder-gray-400 text-sm sm:text-base outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <div className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full liquid-glass-login rounded-lg py-2.5 sm:py-3 pl-8 sm:pl-10 pr-8 sm:pr-10 text-white placeholder-gray-400 text-sm sm:text-base outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-neon-blue-400 hover:text-neon-blue-300 text-xs sm:text-sm"
                >
                  Esqueci a senha
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-neon-blue-400 to-neon-blue-600 rounded-lg py-2.5 sm:py-3 text-white font-medium flex items-center justify-center text-sm sm:text-base transition-all ${isLoading ? "opacity-80" : "hover:brightness-110"}`}
            >
              {isLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              )}
              {isLoading ? "Entrando..." : "Entrar"}
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/10 absolute w-full"></div>
              <span className="bg-black/20 backdrop-blur-md px-2 text-gray-400 text-xs relative">ou continue com</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleLoginWithGoogle}
                className="flex items-center justify-center gap-2 py-2 px-4 bg-white/10 hover:bg-white/20 transition-colors rounded-lg"
              >
                {/* Google logo SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </g>
                </svg>
                <span className="text-white text-sm">Google</span>
              </button>

              <button
                type="button"
                onClick={handleLoginWithApple}
                className="flex items-center justify-center gap-2 py-2 px-4 bg-white/10 hover:bg-white/20 transition-colors rounded-lg"
              >
                {/* Apple logo SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white">
                  <path d="M17.05 20.28c-.98.95-2.05.86-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="text-white text-sm">Apple</span>
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setError("");
                  setSuccess("");
                }}
                className="text-neon-blue-400 hover:text-neon-blue-300 text-sm"
              >
                Não tem uma conta? Registre-se
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}; 
