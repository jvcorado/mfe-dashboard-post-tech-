"use client";

import { useAuth } from "@/context/AuthContext";
import Menu from "@/components/menu";
import WelcomeSection from "@/views/WelcomeSection";
import NewTransactions from "@/components/newTransactions";
import TransactionsSection from "@/views/TransactionsSection";

export default function Home() {
  const { user, accounts, loading, error } = useAuth();

  // Mostrar loading enquanto carrega
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Carregando dashboard...
            </h2>
            <p className="text-gray-600">Carregando suas informações...</p>
          </div>
        </div>
      </div>
    );
  }

  // Se há erro, mostrar tela de erro
  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Erro ao carregar dados
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se não tem dados do usuário, mostrar mensagem
  if (!user || !accounts || accounts.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Nenhum dado encontrado
            </h2>
            <p className="text-gray-600">
              Não foi possível carregar suas informações.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar dashboard com dados
  return (
    <div className="flex flex-col lg:flex-row justify-center items-start gap-6 py-6 px-4 w-full md:h-[calc(100vh_-_6rem)] max-w-screen-xl mx-auto mb-6 lg:mb-0 h-full">
      {/* Menu lateral (vira horizontal em telas menores) */}
      <div className="bg-white w-full max-w-[282px] h-full rounded-[8px] hidden lg:block">
        <Menu />
      </div>

      {/* Seção principal */}
      <div className="flex flex-col justify-between  h-full flex-1 gap-9 w-full">
        <WelcomeSection />
        <NewTransactions />

        {/* TransactionsSection em mobile */}
        <div className="block lg:hidden bg-white rounded-[8px] w-full p-4">
          <TransactionsSection />
        </div>
      </div>

      {/* TransactionsSection fixo em desktop */}
      <div className="hidden lg:block bg-white  w-full max-w-[282px] h-full rounded-[8px] p-4">
        <TransactionsSection />
      </div>
    </div>
  );
}
