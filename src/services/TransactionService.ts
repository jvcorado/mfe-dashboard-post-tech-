// services/TransactionService.ts
import api, { TransactionRequest, TransactionResponse } from '@/lib/api';
import { Transaction } from '@/models/Transaction';
import { AxiosError } from 'axios';

export class TransactionService {
  // Cria nova transação para uma conta específica
  static async create(accountId: number, type: 'INCOME' | 'EXPENSE', amount: number): Promise<Transaction> {
    try {
      const transactionData: TransactionRequest = { type, amount };
      const response = await api.post<TransactionResponse>(`/accounts/${accountId}/transactions`, transactionData);
      return Transaction.fromJSON(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
      if (axiosError.response?.status === 422) {
        const errors = axiosError.response.data.errors;
        if (errors?.amount) {
          throw new Error(errors.amount[0]);
        }
        if (errors?.type) {
          throw new Error(errors.type[0]);
        }
      }
      if (axiosError.response?.status === 404) {
        throw new Error('Conta não encontrada');
      }
      throw new Error('Erro ao criar transação');
    }
  }

  // Atualiza transação existente
  static async update(id: number, type: 'INCOME' | 'EXPENSE', amount: number): Promise<Transaction> {
    try {
      const transactionData: TransactionRequest = { type, amount };
      const response = await api.put<TransactionResponse>(`/transactions/${id}`, transactionData);
      return Transaction.fromJSON(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ errors?: Record<string, string[]> }>;
      if (axiosError.response?.status === 422) {
        const errors = axiosError.response.data.errors;
        if (errors?.amount) {
          throw new Error(errors.amount[0]);
        }
        if (errors?.type) {
          throw new Error(errors.type[0]);
        }
      }
      if (axiosError.response?.status === 404) {
        throw new Error('Transação não encontrada');
      }
      throw new Error('Erro ao atualizar transação');
    }
  }

  // Deleta transação pelo ID
  static async delete(id: number): Promise<void> {
    try {
      await api.delete(`/transactions/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new Error('Transação não encontrada');
      }
      throw new Error('Erro ao deletar transação');
    }
  }
}
