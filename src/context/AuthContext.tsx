"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserModel } from "@/models/User";
import { Account } from "@/models/Account";
import { AuthService } from "@/services/AuthService";
import toast from "react-hot-toast";

interface AuthContextType {
  user: UserModel | null;
  accounts: Account[];
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: (shouldRedirect?: boolean) => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateAfterTransaction: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserModel | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verifica se há token e carrega dados do usuário
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setError(null);
        console.log("🚀 Inicializando AuthContext do dashboard...");

        // Verificar se já tem token no localStorage
        let token = AuthService.getToken();

        // Se não tem token, solicitar do MFE core
        if (
          !token &&
          typeof window !== "undefined" &&
          window.parent &&
          window.parent !== window
        ) {
          console.log("🔑 Solicitando token do MFE core...");

          // Enviar mensagem solicitando token
          window.parent.postMessage({ type: "REQUEST_TOKEN" }, "*");

          // Aguardar resposta por até 5 segundos
          const tokenPromise = new Promise<string | null>((resolve) => {
            const handleMessage = (event: MessageEvent) => {
              if (event.data && event.data.type === "TOKEN_RESPONSE") {
                window.removeEventListener("message", handleMessage);
                resolve(event.data.token || null);
              }
            };

            window.addEventListener("message", handleMessage);

            // Timeout
            setTimeout(() => {
              window.removeEventListener("message", handleMessage);
              resolve(null);
            }, 5000);
          });

          token = await tokenPromise;

          if (token) {
            localStorage.setItem("auth_token", token);
            console.log("✅ Token recebido e salvo");
          }
        }

        console.log(
          "🔍 Verificando token no dashboard:",
          token ? "EXISTE" : "NÃO EXISTE"
        );

        if (token) {
          // Tenta carregar dados do usuário do localStorage primeiro
          const storedUser = AuthService.getUserFromStorage();
          if (storedUser) {
            console.log(
              "👤 Usuário encontrado no localStorage:",
              storedUser.name
            );
            setUser(storedUser);
          }

          // Depois busca dados atualizados do servidor
          console.log("🔄 Buscando dados atualizados do servidor...");
          await refreshUserData();

          console.log("✅ Dados carregados com sucesso");
        } else {
          console.log("❌ Token não encontrado");
          setError("Token de autenticação não encontrado");
          // Garantir que o estado seja válido mesmo sem token
          setUser(null);
          setAccounts([]);
        }
      } catch (error) {
        console.error("❌ Erro ao inicializar autenticação:", error);
        setError(
          error instanceof Error ? error.message : "Erro ao carregar dados"
        );
        // Limpa os dados em caso de erro
        setUser(null);
        setAccounts([]);
      } finally {
        console.log("✅ AuthContext inicializado - loading: false");
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user: loggedUser } = await AuthService.login(email, password);
      setUser(loggedUser);
      toast.success("Login realizado com sucesso!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao fazer login";
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const { user: newUser, account } = await AuthService.register(
        name,
        email,
        password
      );
      setUser(newUser);
      setAccounts([account]);

      toast.success("Conta criada com sucesso!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao registrar usuário";
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (shouldRedirect: boolean = true) => {
    try {
      console.log("🚪 Iniciando logout no dashboard...");
      await AuthService.logout();
      setUser(null);
      setAccounts([]);

      // COMUNICA LOGOUT PARA O MFE CORE
      if (typeof window !== "undefined") {
        console.log("📤 Enviando mensagem de logout para MFE Core");
        window.parent.postMessage({ type: "AUTH_LOGOUT" }, "*");
      }

      if (shouldRedirect) {
        toast.success("Logout realizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, limpa os dados locais e comunica
      setUser(null);
      setAccounts([]);

      // COMUNICA LOGOUT PARA O MFE CORE MESMO COM ERRO
      if (typeof window !== "undefined") {
        console.log("📤 Enviando mensagem de logout para MFE Core (após erro)");
        window.parent.postMessage({ type: "AUTH_LOGOUT" }, "*");
      }
    }
  };

  const refreshUserData = async () => {
    try {
      console.log("🔄 Iniciando refreshUserData...");
      const { user: userData, accounts: userAccounts } =
        await AuthService.getCurrentUser();
      setUser(userData);
      setAccounts(userAccounts);
      console.log(
        "✅ Dados do usuário atualizados:",
        userData.name,
        "Contas:",
        userAccounts.length
      );

      // Salvar dados atualizados no localStorage
      localStorage.setItem("user_data", JSON.stringify(userData.toJSON()));
    } catch (error) {
      console.error("❌ Erro ao atualizar dados do usuário:", error);
      throw error;
    }
  };

  // Método para atualizar dados após transações
  const updateAfterTransaction = async () => {
    try {
      console.log("🔄 Atualizando dados após transação...");
      setLoading(true);
      await refreshUserData();
      console.log("✅ Dados atualizados após transação");
    } catch (error) {
      console.error("❌ Erro ao atualizar dados após transação:", error);
      setError("Erro ao atualizar dados após transação");
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user && AuthService.isAuthenticated();

  // Garantir que accounts nunca seja undefined
  const safeAccounts = accounts || [];

  console.log(
    "🎯 AuthContext render - loading:",
    loading,
    "isAuthenticated:",
    isAuthenticated,
    "user:",
    user?.name
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        accounts: safeAccounts,
        loading,
        error,
        login,
        register,
        logout,
        refreshUserData,
        updateAfterTransaction,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error("useAuth deve ser usado dentro de um AuthProvider");
    // Retorna um objeto com valores padrão para evitar erros
    return {
      user: null,
      accounts: [],
      loading: false,
      error: null,
      login: async () => {
        throw new Error("AuthProvider não encontrado");
      },
      register: async () => {
        throw new Error("AuthProvider não encontrado");
      },
      logout: async () => {
        throw new Error("AuthProvider não encontrado");
      },
      refreshUserData: async () => {
        throw new Error("AuthProvider não encontrado");
      },
      updateAfterTransaction: async () => {
        throw new Error("AuthProvider não encontrado");
      },
      isAuthenticated: false,
    };
  }
  return context;
};
