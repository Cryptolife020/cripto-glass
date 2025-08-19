import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, Profile } from "../lib/supabase";

interface User {
  id: string;
  email: string;
  name: string;
  roles: string; // Campo roles conforme definido na tabela
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processSession = async (session: any) => {
      setLoading(true);
      try {
        if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || 'Usuário',
            roles: 'user' // Default role
          };

          const profile = await authService.getUserProfile(session.user.id);
          if (profile && profile.name) {
            userData.name = profile.name;
            userData.roles = profile.roles || 'user';
          }

          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(userData.roles === 'admin');
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    const initializeAuth = async () => {
      const { data: { session } } = await authService.getSession();
      await processSession(session);
    };

    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      if (_event !== 'INITIAL_SESSION') {
        processSession(session);
      }
    });

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await authService.signIn(email, password);

      if (error) {
        return { success: false, error: error.message };
      }

      // O onAuthStateChange vai lidar com a atualização do estado
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Falha no login. Tente novamente mais tarde.' };
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const { data, error } = await authService.signUp(email, password, name);

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      // Alguns provedores de autenticação exigem confirmação de email
      if (data?.user && data.user.identities?.length === 0) {
        setLoading(false);
        return { success: true, error: 'Por favor, verifique seu email para confirmar seu cadastro.' };
      }

      // Se o registro for bem-sucedido e não precisar de confirmação, faça login automaticamente
      if (data?.user) {
        const profile = await authService.getUserProfile(data.user.id);

        if (profile) {
          const userData: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            roles: profile.roles
          };

          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(profile.roles === 'admin');

          return { success: true };
        }
      }

      return { success: true, error: 'Registro concluído. Por favor, faça login.' };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Falha no registro. Tente novamente mais tarde.' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { error } = await authService.resetPassword(email);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: 'Instruções de recuperação de senha foram enviadas para seu email.' };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Falha na recuperação de senha. Tente novamente mais tarde.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isAdmin, loading, login, logout, register, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};