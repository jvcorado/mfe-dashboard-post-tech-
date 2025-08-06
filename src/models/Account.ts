// models/Account.ts

import { TransactionService } from "@/services/TransactionService";
import { Transaction } from "./Transaction";
import { TransactionType } from "./TransactionType";

export interface AccountData {
  id: number;
  name: string;
  balance?: number;
  user_id?: number;
  transactions_count?: number;
  created_at: string;
  updated_at: string;
  // description: string;
}

export class Account {
  public id: number;
  public name: string;
  public balance: number;
  public user_id?: number;
  public transactions_count?: number;
  public created_at: string;
  public updated_at: string;
  //public description: string;

  constructor(data: AccountData) {
    this.id = data.id;
    this.name = data.name;
    this.balance = data.balance || 0;
    this.user_id = data.user_id;
    this.transactions_count = data.transactions_count;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    //this.description = data.description;
  }

  static fromJSON(data: AccountData): Account {
    return new Account(data);
  }

  toJSON(): AccountData {
    return {
      id: this.id,
      name: this.name,
      balance: this.balance,
      user_id: this.user_id,
      transactions_count: this.transactions_count,
      created_at: this.created_at,
      updated_at: this.updated_at,
      //description: this.description,
    };
  }

  // Formatação de saldo para exibição
  getFormattedBalance(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(this.balance);
  }
  async getTransactions(): Promise<Transaction[]> {
    return await TransactionService.getAllByAccount(this.id);
  }

  // Verifica se tem saldo suficiente para uma despesa
  hasSufficientBalance(amount: number): boolean {
    return this.balance >= amount;
  }
  //calcula despesas totais
  async getExpenses(): Promise<number> {
    const transactions = await this.getTransactions();
    return transactions.reduce((acc, tx) => {
      if (tx.type === TransactionType.EXPENSE) {
        console.log(acc + tx.amount)
        return acc += tx.amount;
      }
      return acc;
    }, 0);
  }

  //calcula total de despesas baseado nos meses e categorias 
  async getExpensesByCategoryForMonth(month: number, year: number): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    const filtered = transactions.filter((tx) => {
      const txDate = new Date(tx.created_at);
      return (
        tx.type === TransactionType.EXPENSE &&
        txDate.getMonth() + 1 === month &&
        txDate.getFullYear() === year
      );
    });

    const grouped: Record<string, Transaction> = {};

    filtered.forEach((tx) => {
      const category = tx.subtype || "Outros";

      if (!grouped[category]) {
        grouped[category] = Transaction.fromJSON({
          id: tx.id,
          subtype: category,
          amount: 0, // Inicializa com zero para somar corretamente
          type: TransactionType.EXPENSE,
          account_id: tx.account_id,
          created_at: tx.created_at,
          updated_at: tx.updated_at,
          description: tx.description || "", // Adiciona a propriedade obrigatória 'description'
        });
      }

      grouped[category].amount += tx.amount;
    });

    return Object.values(grouped);
  }

}
