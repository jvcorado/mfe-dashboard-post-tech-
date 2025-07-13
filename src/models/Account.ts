// models/Account.ts

export interface AccountData {
  id: number;
  name: string;
  balance?: number;
  user_id?: number;
  transactions_count?: number;
  created_at: string;
  updated_at: string;
}

export class Account {
  public id: number;
  public name: string;
  public balance: number;
  public user_id?: number;
  public transactions_count?: number;
  public created_at: string;
  public updated_at: string;

  constructor(data: AccountData) {
    this.id = data.id;
    this.name = data.name;
    this.balance = data.balance || 0;
    this.user_id = data.user_id;
    this.transactions_count = data.transactions_count;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
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
    };
  }

  // Formatação de saldo para exibição
  getFormattedBalance(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(this.balance);
  }

  // Verifica se tem saldo suficiente para uma despesa
  hasSufficientBalance(amount: number): boolean {
    return this.balance >= amount;
  }
}
