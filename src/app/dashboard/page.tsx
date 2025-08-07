"use client";

import { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import Menu from "@/components/menu";
import TransactionsSection from "@/views/TransactionsSection";
import FinanceChart from "@/components/FinanceChart";

export default function Dashboard() {
  const { user, accounts, error, loading } = useAuth();

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
    <div className="flex flex-col lg:flex-row justify-center items-start gap-6 py-6 px-4 w-full mx-auto">
      {/* Menu lateral (vira horizontal em telas menores) */}
      <div className="bg-white w-full max-w-[282px] h-full rounded-[8px] hidden lg:block">
        <Suspense fallback={<div className="p-4">Carregando menu...</div>}>
          <Menu />
        </Suspense>
      </div>

      {/* Seção principal */}
      <div>
        <FinanceChart />

        {/* TransactionsSection em mobile */}
        <div className="block lg:hidden bg-white rounded-[8px] w-full p-4">
          <TransactionsSection />
        </div>
      </div>
    </div>
  );
}
