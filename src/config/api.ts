// Configurações da API
export const API_CONFIG = {
    // URL base da API Laravel - usando rewrite do Next.js para evitar CORS
    BASE_URL: '/mf',

    // Timeout para requisições (em milissegundos)
    TIMEOUT: 10000,

    // Chaves para localStorage
    STORAGE_KEYS: {
        AUTH_TOKEN: 'auth_token',
        USER_DATA: 'user_data',
    },

    // Configurações de headers
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },

    // Endpoints da API
    ENDPOINTS: {
        // Autenticação
        LOGIN: '/login',
        REGISTER: '/register',
        LOGOUT: '/logout',
        ME: '/me',

        // Contas
        ACCOUNTS: '/accounts',
        ACCOUNT_BY_ID: (id: number) => `/accounts/${id}`,

        // Transações
        TRANSACTIONS: '/transactions',
        TRANSACTION_BY_ID: (id: number) => `/transactions/${id}`,
        ACCOUNT_TRANSACTIONS: (accountId: number) => `/accounts/${accountId}/transactions`,
    },

    // Códigos de status HTTP
    STATUS_CODES: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        UNAUTHORIZED: 401,
        NOT_FOUND: 404,
        VALIDATION_ERROR: 422,
        SERVER_ERROR: 500,
    },

    // Mensagens de erro padrão
    ERROR_MESSAGES: {
        NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
        UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
        SERVER_ERROR: 'Erro interno do servidor. Tente novamente mais tarde.',
        VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
        NOT_FOUND: 'Recurso não encontrado.',
        GENERIC_ERROR: 'Ocorreu um erro inesperado.',
    },
};

// Função para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Função para verificar se está em desenvolvimento
export const isDevelopment = (): boolean => {
    return process.env.NODE_ENV === 'development';
};

// Função para log de debug (apenas em desenvolvimento)
export const debugLog = (message: string, data?: unknown): void => {
    if (isDevelopment()) {
        console.log(`[API Debug] ${message}`, data);
    }
}; 