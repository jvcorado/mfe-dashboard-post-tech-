"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log(
        "🚫 Usuário não autenticado - redirecionando para página inicial"
      );
      console.log(
        "🔍 Debug - loading:",
        loading,
        "isAuthenticated:",
        isAuthenticated
      );

      // Verificar se estamos em um iframe (MFE)
      if (window.parent && window.parent !== window) {
        // Se estamos em um iframe, enviar mensagem para o parent
        window.parent.postMessage({ type: "LOGOUT_REDIRECT" }, "*");
      } else {
        // Se não estamos em iframe, redirecionar diretamente
        window.location.href = "/";
      }
    }
  }, [isAuthenticated, loading, router]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#47A138] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, não renderiza nada (será redirecionado)
  if (!isAuthenticated) {
    return null;
  }

  // Se está autenticado, renderiza o conteúdo
  return <>{children}</>;
}
