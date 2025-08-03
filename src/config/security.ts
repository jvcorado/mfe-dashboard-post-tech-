// Configurações de segurança para comunicação entre microfrontends
export const SECURITY_CONFIG = {
    // Lista de origens confiáveis para PostMessage
    TRUSTED_ORIGINS: [
        // Desenvolvimento local
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:3003',

        // Produção - URLs do Vercel
        'https://mfe-core.vercel.app',
        'https://mfe-auth-post-tech.vercel.app',
        'https://mfe-dashboard-post-tech.vercel.app',
        'https://mfe-landing-pos-tech.vercel.app',
    ],

    // URLs customizáveis via variáveis de ambiente
    CUSTOM_ORIGINS: [
        process.env.NEXT_PUBLIC_SHELL_URL,
        process.env.NEXT_PUBLIC_AUTH_URL,
        process.env.NEXT_PUBLIC_DASHBOARD_URL,
    ].filter(Boolean) as string[],
};

/**
 * Verifica se uma origem é confiável
 * @param origin - A origem a ser verificada
 * @returns true se a origem for confiável
 */
export function isTrustedOrigin(origin: string): boolean {
    const allTrustedOrigins = [
        ...SECURITY_CONFIG.TRUSTED_ORIGINS,
        ...SECURITY_CONFIG.CUSTOM_ORIGINS,
    ];

    // Verificação exata da origem
    if (allTrustedOrigins.includes(origin)) {
        return true;
    }

    // Verificação para localhost (qualquer porta)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return true;
    }

    // Verificação para domínios Vercel
    if (origin.includes('.vercel.app')) {
        return true;
    }

    return false;
}

/**
 * Obtém a origem do shell principal baseado no ambiente atual
 * @returns A origem do shell principal
 */
export function getShellOrigin(): string {
    const currentHost = window.location.hostname;

    // Se há uma URL personalizada definida
    if (process.env.NEXT_PUBLIC_SHELL_URL) {
        return process.env.NEXT_PUBLIC_SHELL_URL;
    }

    // Em produção (Vercel)
    if (currentHost.includes('vercel.app')) {
        return '*'; // Usar wildcard para flexibilidade em produção
    }

    // Em desenvolvimento
    return 'http://localhost:3000';
} 