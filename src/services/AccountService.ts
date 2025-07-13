// services/AccountService.ts
import api, { AccountResponse, AccountDetailResponse } from '@/lib/api';
import { Account } from '@/models/Account';
import { Transaction, TransactionData } from '@/models/Transaction';
import { AxiosError } from 'axios';

export class AccountService {
  // Busca todas as contas do usuário autenticado
  static async getAll(): Promise<Account[]> {
    try {
      const response = await api.get<AccountResponse[]>('/accounts');
      return response.data.map(Account.fromJSON);
    } catch {
      throw new Error('Erro ao buscar contas');
    }
  }

  // Busca conta por ID com transações
  static async getById(id: number): Promise<{ account: Account; transactions: Transaction[] }> {
    try {
      const response = await api.get<AccountDetailResponse>(`/accounts/${id}`);
      const data = response.data;

      return {
        account: Account.fromJSON({
          id: data.id,
          name: data.name,
          balance: data.balance,
          created_at: data.created_at,
          updated_at: data.updated_at,
        }),
        transactions: data.transactions.map(tx => Transaction.fromJSON(tx as TransactionData))
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new Error('Conta não encontrada');
      }
      throw new Error('Erro ao buscar conta');
    }
  }

  // Cria uma nova conta
  static async create(name: string): Promise<Account> {
    try {
      const response = await api.post<AccountResponse>('/accounts', { name });
      return Account.fromJSON(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
      if (axiosError.response?.status === 422) {
        const errors = axiosError.response.data.errors;
        if (errors?.name) {
          throw new Error(errors.name[0]);
        }
      }
      throw new Error('Erro ao criar conta');
    }
  }

  // Atualiza conta existente
  static async update(id: number, name: string): Promise<Account> {
    try {
      const response = await api.put<AccountResponse>(`/accounts/${id}`, { name });
      return Account.fromJSON(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
      if (axiosError.response?.status === 404) {
        throw new Error('Conta não encontrada');
      }
      if (axiosError.response?.status === 422) {
        const errors = axiosError.response.data.errors;
        if (errors?.name) {
          throw new Error(errors.name[0]);
        }
      }
      throw new Error('Erro ao atualizar conta');
    }
  }

  // Deleta conta pelo ID
  static async delete(id: number): Promise<void> {
    try {
      await api.delete(`/accounts/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new Error('Conta não encontrada');
      }
      throw new Error('Erro ao deletar conta');
    }
  }
}
