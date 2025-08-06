// services/AuthService.ts
import api, {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    UserResponse
} from '@/lib/api';
import { UserModel } from '@/models/User';
import { Account } from '@/models/Account';
import { AxiosError } from 'axios';

export class AuthService {
    // Login com email e senha
    static async login(email: string, password: string): Promise<{ user: UserModel; token: string }> {
        try {
            const loginData: LoginRequest = { email, password };
            const response = await api.post<AuthResponse>('/login', loginData);

            const { user, access_token } = response.data;

            // Salvar token no localStorage
            localStorage.setItem('auth_token', access_token);
            localStorage.setItem('user_data', JSON.stringify(user));

            return {
                user: UserModel.fromJSON(user),
                token: access_token
            };
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 401) {
                throw new Error('Credenciais inválidas');
            }
            throw new Error('Erro ao fazer login. Tente novamente.');
        }
    }

    // Registro com nome, email e senha
    static async register(name: string, email: string, password: string): Promise<{ user: UserModel; account: Account }> {
        try {
            const registerData: RegisterRequest = { name, email, password };
            const response = await api.post<AuthResponse>('/register', registerData);

            const { user, access_token } = response.data;

            // Salvar token no localStorage
            localStorage.setItem('auth_token', access_token);
            localStorage.setItem('user_data', JSON.stringify(user));

            // Buscar dados completos do usuário (incluindo contas)
            const userDataResponse = await api.get<UserResponse>('/me');
            const { accounts } = userDataResponse.data;

            return {
                user: UserModel.fromJSON(user),
                account: Account.fromJSON(accounts[0]) // Primeira conta criada
            };
        } catch (error) {
            const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
            if (axiosError.response?.status === 422) {
                const errors = axiosError.response.data.errors;
                if (errors?.email) {
                    throw new Error('Este email já está em uso');
                }
                if (errors?.password) {
                    throw new Error('A senha deve ter pelo menos 6 caracteres');
                }
            }
            throw new Error('Erro ao registrar usuário. Tente novamente.');
        }
    }

    // Logout
    static async logout(): Promise<void> {
        try {
            await api.post('/logout');
        } catch (error) {
            // Mesmo se a requisição falhar, limpar dados locais
            console.warn('Erro ao fazer logout no servidor:', error);
        } finally {
            // Limpar dados locais
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
        }
    }

    // Obter dados do usuário atual
    static async getCurrentUser(): Promise<{ user: UserModel; accounts: Account[] }> {
        try {
            const response = await api.get<UserResponse>('/me');
            const { user, accounts } = response.data;

            return {
                user: UserModel.fromJSON(user),
                accounts: accounts.map(Account.fromJSON)
            };
        } catch (error) {
            console.error('Erro no getCurrentUser:', error);
            throw new Error('Erro ao buscar dados do usuário');
        }
    }

    // Verificar se o usuário está autenticado
    static isAuthenticated(): boolean {
        const token = localStorage.getItem('auth_token');
        return !!token;
    }

    // Obter token do localStorage
    static getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    // Obter dados do usuário do localStorage
    static getUserFromStorage(): UserModel | null {
        const userData = localStorage.getItem('user_data');
        if (userData) {
            try {
                return UserModel.fromJSON(JSON.parse(userData));
            } catch (error) {
                console.error('Erro ao parsear dados do usuário:', error);
                return null;
            }
        }
        return null;
    }

    // Renovar token
    static async refreshToken(): Promise<string | null> {
        try {
            const currentToken = this.getToken();
            if (!currentToken) {
                throw new Error('Nenhum token encontrado');
            }

            const response = await api.post('/refresh', {});
            const { access_token } = response.data;

            if (access_token) {
                localStorage.setItem('auth_token', access_token);
                console.log("✅ Token renovado com sucesso");
                return access_token;
            }

            return null;
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            // Se falhar ao renovar, limpar dados
            this.clearAuthData();
            return null;
        }
    }

    // Limpar dados de autenticação
    static clearAuthData(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        console.log("🧹 Dados de autenticação limpos");
    }
}
