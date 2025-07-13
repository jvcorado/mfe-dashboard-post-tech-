"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import WelcomeSection from "@/views/WelcomeSection";
import Menu from "@/components/menu";
import NewTransactions from "@/components/new_transactions";
import TransactionsSection from "@/views/TransactionsSection";

function DashboardContent() {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token");
  const [postMessageToken, setPostMessageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener para receber token via PostMessage
    const handleMessage = (event: MessageEvent) => {
      // Verificar origem por segurança (ajuste conforme necessário)
      if (event.origin !== "http://localhost:3001") {
        console.log("Mensagem de origem não confiável:", event.origin);
        return;
      }

      console.log("Mensagem recebida:", event.data);

      // Processar token de autenticação
      if (event.data.type === "AUTH_TOKEN" && event.data.token) {
        console.log("Token recebido via PostMessage:", event.data.token);
        setPostMessageToken(event.data.token);
        setLoading(false);

        // Salvar token no localStorage
        localStorage.setItem("auth_token", event.data.token);
      }
    };

    // Adicionar listener
    window.addEventListener("message", handleMessage);

    // Função para solicitar token do shell principal
    const requestToken = () => {
      if (window.parent && window.parent !== window) {
        console.log("Solicitando token do shell principal...");
        window.parent.postMessage(
          {
            type: "REQUEST_TOKEN",
            timestamp: Date.now(),
          },
          "http://localhost:3001"
        );
      } else {
        console.log("Não está em um iframe, não pode solicitar token");
        setLoading(false);
      }
    };

    // Verificar se já tem token no localStorage
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      console.log("Token encontrado no localStorage:", storedToken);
      setPostMessageToken(storedToken);
      setLoading(false);
    } else {
      // Solicitar token após um pequeno delay
      setTimeout(requestToken, 500);
    }

    // Timeout para parar o loading se não receber token
    const timeoutId = setTimeout(() => {
      if (!postMessageToken) {
        console.log("Timeout: Token não recebido");
        setLoading(false);
      }
    }, 5000);

    // Cleanup
    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timeoutId);
    };
  }, [postMessageToken]);

  // Determinar qual token usar (PostMessage tem prioridade)
  const activeToken = postMessageToken || urlToken;

  return (
    <div className="p-6">
      {loading && (
        <div className="bg-blue-100 p-4 rounded-lg mb-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <p className="text-blue-700">Aguardando token via PostMessage...</p>
          </div>
        </div>
      )}

      {activeToken && (
        <div className="flex flex-col lg:flex-row justify-center items-start gap-6 py-6 px-4 w-full  md:h-[calc(100vh_-_6rem)] max-w-screen-xl mx-auto">
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
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
