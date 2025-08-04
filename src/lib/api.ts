import { TransactionSubtype, TransactionType } from '@/models/TransactionType';
import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Função para solicitar token do MFE core
const requestTokenFromParent = (): Promise<string | null> => {
    return new Promise((resolve) => {
        console.log("🔑 Solicitando token do shell principal...");

        // Envia mensagem para o MFE core solicitando o token
        if (typeof window !== "undefined" && window.parent) {
            window.parent.postMessage({ type: "REQUEST_TOKEN" }, "*");

            // Listener temporário para receber o token
            const handleTokenResponse = (event: MessageEvent) => {
                console.log("📨 Resposta recebida na API:", event.data);

                if (event.data && event.data.type === "TOKEN_RESPONSE") {
                    window.removeEventListener("message", handleTokenResponse);
                    console.log("✅ Token recebido do MFE core:", event.data.token ? "EXISTE" : "NÃO EXISTE");
                    resolve(event.data.token || null);
                }
            };

            window.addEventListener("message", handleTokenResponse);

            // Timeout para não ficar esperando indefinidamente
            setTimeout(() => {
                window.removeEventListener("message", handleTokenResponse);
                console.log("⏰ Timeout: Token não recebido na API");
                resolve(null);
            }, 2000);
        } else {
            console.log("❌ Não está em iframe, não pode solicitar token");
            resolve(null);
        }
    });
};

// Criar instância do axios
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000, // 10 segundos
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem('auth_token');

        // Se não tem token no localStorage, tenta solicitar do MFE core
        if (!token) {
            console.log("🔍 Token não encontrado no localStorage, solicitando do MFE core...");
            token = await requestTokenFromParent();
            // Salva o token recebido no localStorage local
            if (token) {
                localStorage.setItem('auth_token', token);
                console.log("💾 Token salvo no localStorage da API");
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratamento de respostas e erros
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        // Token expirado ou inválido
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            toast.error('Sessão expirada. Faça login novamente.');

            // Redirecionar para login se não estiver na página de login/registro
            if (typeof window !== 'undefined' &&
                !window.location.pathname.includes('/login') &&
                !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }

        // Erro de validação
        if (error.response?.status === 422) {
            const validationErrors = error.response.data as { errors?: Record<string, string[]> };
            if (validationErrors.errors) {
                Object.values(validationErrors.errors).forEach(messages => {
                    messages.forEach(message => toast.error(message));
                });
            }
        }

        // Outros erros
        if (error.response?.status === 500) {
            toast.error('Erro interno do servidor. Tente novamente mais tarde.');
        }

        return Promise.reject(error);
    }
);

export default api;

// Tipos para as respostas da API
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

// Tipos para autenticação
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: number;
        name: string;
        email: string;
        email_verified_at: string | null;
        created_at: string;
        updated_at: string;
    };
    access_token: string;
    token_type: string;
    message: string;
}

export interface UserResponse {
    user: {
        id: number;
        name: string;
        email: string;
        email_verified_at: string | null;
        created_at: string;
        updated_at: string;
    };
    accounts: Array<{
        id: number;
        name: string;
        user_id: number;
        created_at: string;
        updated_at: string;
    }>;
}

// Tipos para contas
export interface AccountResponse {
    id: number;
    name: string;
    balance: number;
    transactions_count?: number;
    created_at: string;
    updated_at: string;
}

export interface AccountDetailResponse {
    id: number;
    name: string;
    balance: number;
    transactions: Array<{
        id: number;
        type: TransactionType;
        amount: number;
        account_id: number;
        created_at: string;
        updated_at: string;
    }>;
    created_at: string;
    updated_at: string;
}

// Tipos para transações
export interface TransactionRequest {
    type: TransactionType;
    amount: number;
}

export interface TransactionResponse {
    id: number;
    type: TransactionType;
    subtype: TransactionSubtype;
    amount: number;
    account_id: number;
    created_at: string;
    updated_at: string;
} 