// services/TransactionService.ts
import api, { TransactionRequest, TransactionResponse, TransactionWithDocumentRequest } from "@/lib/api";
import { Transaction } from "@/models/Transaction";
import { TransactionSubtype, TransactionType } from "@/models/TransactionType";
import { AxiosError } from "axios";

export class TransactionService {
  // Cria nova transação para uma conta específica
  //TODO: Implementar o upload de documento no formato multipart/form-data
  static async create(
    accountId: number,
    type: TransactionType,
    subtype: TransactionSubtype,
    description: string,
    amount: number,
    document?: string,
  ): Promise<Transaction> {
    try {
      const transactionData: TransactionRequest = { type, subtype, amount, description, document };
      const response = await api.post<TransactionResponse>(
        `/accounts/${accountId}/transactions`,
        transactionData
      );
      return Transaction.fromJSON(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{
        errors?: Record<string, string[]>;
      }>;
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
        throw new Error("Conta não encontrada");
      }
      throw new Error("Erro ao criar transação");
    }
  }

  static async createWithDocument(
    accountId: number,
    type: TransactionType,
    amount: number,
    document: File
  ): Promise<Transaction> {
    try {
      const formData = new FormData();
      formData.append("amount", String(amount));
      formData.append("type", type);

      if (document) {
        formData.append("document", document);
      }

      const transactionData: TransactionWithDocumentRequest = { type, amount, document };
      const response = await api.post<TransactionResponse>(
        `/accounts/${accountId}/transactions`,
        transactionData
      );
      return Transaction.fromJSON(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{
        errors?: Record<string, string[]>;
      }>;
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
        throw new Error("Conta não encontrada");
      }
      throw new Error("Erro ao criar transação");
    }
  }

  // Atualiza transação existente
  static async update(
    id: number,
    type: TransactionType,
    subtype: TransactionSubtype,
    amount: number,
    description: string,
    document?: string
  ): Promise<Transaction> {
    try {
      const transactionData: TransactionRequest = { type, amount, subtype, description, document };
      const response = await api.put<TransactionResponse>(
        `/transactions/${id}`,
        transactionData
      );
      return Transaction.fromJSON(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{
        errors?: Record<string, string[]>;
      }>;
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
        throw new Error("Transação não encontrada");
      }
      throw new Error("Erro ao atualizar transação");
    }
  }

  // Deleta transação pelo ID
  static async delete(id: number): Promise<void> {
    try {
      await api.delete(`/transactions/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        throw new Error("Transação não encontrada");
      }
      throw new Error("Erro ao deletar transação");
    }
  }
}
