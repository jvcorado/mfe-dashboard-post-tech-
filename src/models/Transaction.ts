import { TransactionType } from "./TransactionType";

export interface TransactionData {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  account_id: number;
  created_at: string;
  updated_at: string;
}

export class Transaction {
  public id: number;
  public type: TransactionType;
  public amount: number;
  public account_id: number;
  public created_at: string;
  public updated_at: string;

  constructor(data: TransactionData) {
    this.id = data.id;
    this.type = data.type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE;
    this.amount = data.amount;
    this.account_id = data.account_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static fromJSON(data: TransactionData): Transaction {
    return new Transaction(data);
  }

  toJSON(): TransactionData {
    return {
      id: this.id,
      type: this.type === TransactionType.INCOME ? 'INCOME' : 'EXPENSE',
      amount: this.amount,
      account_id: this.account_id,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  // Formatação de valor para exibição
  getFormattedAmount(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(this.amount);
  }

  // Formatação de data para exibição
  getFormattedDate(): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(this.created_at));
  }

  // Verifica se é uma receita
  isIncome(): boolean {
    return this.type === TransactionType.INCOME;
  }

  // Verifica se é uma despesa
  isExpense(): boolean {
    return this.type === TransactionType.EXPENSE;
  }
}
